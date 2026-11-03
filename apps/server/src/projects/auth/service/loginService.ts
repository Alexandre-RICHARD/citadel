import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { acceptsLoginMethod } from "@citadel/specs/src/projects/auth/helper/acceptsLoginMethod.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { ServiceUnavailableError } from "../../../error/ServiceUnavailableError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import { UnauthorizedError } from "../../../error/UnauthorizedError.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { PasswordLoginBean } from "../bean/passwordLoginBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { User } from "../models/User.ts";
import { findConfirmedFactorTypesQuery } from "../query/factor/findConfirmedFactorTypesQuery.ts";
import { deleteFlowQuery } from "../query/flow/deleteFlowQuery.ts";
import { findUserByIdQuery } from "../query/user/findUserByIdQuery.ts";
import { rehashUserPasswordQuery } from "../query/user/rehashUserPasswordQuery.ts";
import { authEventService } from "./authEventService.ts";
import { flowService } from "./flowService.ts";
import { passwordService } from "./passwordService.ts";
import { sessionService } from "./sessionService.ts";
import { userService } from "./userService.ts";

type MailLogin = {
	identifier: string;
	remember: boolean;
};

class LoginService {
	/**
	 * Identifiant inconnu, mauvais mot de passe, ou connexion par mot de passe fermée par le compte : même 401, même
	 * durée (le mot de passe est toujours vérifié, contre un hash factice au besoin), même compte des échecs. Avec un
	 * second facteur, le parcours « second facteur » commence : aucune session avant sa fin
	 */
	async loginWithPassword(
		{ identifier, password, remember }: PasswordLoginBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const user = await userService.findByIdentifier(identifier);
		const attempt = {
			accountKey: user === null ? identifier.toLowerCase() : String(user.id),
			ip: browser.client.ip,
		};
		const retryAfterMs = authLimiter.getAttemptRetryAfterMs(attempt);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Wait before trying this account again",
				retryAfterMs,
				AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
			);

		const isPasswordValid = await passwordService.verify(
			password,
			user?.passwordHash ?? null,
		);
		if (
			user === null ||
			!isPasswordValid ||
			!acceptsLoginMethod(user.loginMethods, LoginMethodEnum.PASSWORD)
		) {
			authLimiter.recordFailure(attempt);
			await authEventService.record({
				type: AuthEventTypeEnum.LOGIN_FAILED,
				userId: user?.id ?? null,
				client: browser.client,
			});
			throw new UnauthorizedError(
				AuthErrorCodeEnum.INVALID_CREDENTIALS,
				"Unknown identifier or wrong password",
			);
		}

		await this.#rehashIfOutdated(user, password);
		const factorTypes = await findConfirmedFactorTypesQuery(user.id);
		// Les échecs du compte ne repartent de zéro qu'une fois connecté : redonner le mot de passe entre deux erreurs de
		// second facteur n'efface pas celles-ci
		if (factorTypes.length > 0)
			return flowService.startSecondFactor({
				userId: user.id,
				email: user.email,
				remember,
				browser,
			});
		authLimiter.recordSuccess(attempt);
		return this.openSession(
			user.id,
			remember,
			browser,
			AuthEventTypeEnum.LOGIN_SUCCEEDED,
		);
	}

	/**
	 * « Recevoir un lien de connexion par email ». Identifiant inconnu, ou compte qui n'accepte que le mot de passe : un
	 * parcours leurre, même réponse, aucun mail
	 */
	async startMailLogin(
		{ identifier, remember }: MailLogin,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const user = await userService.findByIdentifier(identifier);
		const account =
			user !== null &&
			acceptsLoginMethod(user.loginMethods, LoginMethodEnum.MAIL)
				? user
				: null;
		return flowService.start({
			kind: FlowKindEnum.MAIL_LOGIN,
			userId: account?.id ?? null,
			email: account?.email ?? identifier,
			payload: { identifier },
			remember,
			durationMs: authSettings.flowDurationMs.mailLogin,
			browser,
		});
	}

	/**
	 * La boîte mail est prouvée : elle remplace le mot de passe, jamais l'application d'authentification. Avec un TOTP,
	 * il est demandé ensuite (le code par mail n'y est jamais proposé : la boîte vient d'être prouvée) ; sans, la session
	 * s'ouvre, un facteur mail seul ne protégeant que d'un mot de passe volé
	 */
	async completeMailStep(
		verified: VerifiedFlowBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const { flow, flowToken } = verified;
		const userId = flowService.requireAccount(flow);
		await this.#assertStillAcceptsMail(userId);
		const secondFactorMethods = await flowService.listSecondFactorMethods({
			kind: flow.kind,
			step: FlowStepEnum.SECOND_FACTOR,
			userId,
		});
		const secondFactorFlow = await flowService.consumeMailStep(
			verified,
			async (transaction) => {
				if (secondFactorMethods.includes(SecondFactorMethodEnum.TOTP))
					return flowService.advance(
						flow,
						FlowStepEnum.SECOND_FACTOR,
						{
							durationMs: authSettings.flowDurationMs.secondFactor,
							secondFactorMethods,
						},
						transaction,
					);
				await deleteFlowQuery(flow.id, transaction);
				return null;
			},
		);

		if (secondFactorFlow !== null)
			return {
				isCompleted: false,
				flow: secondFactorFlow,
				flowCookie: { token: flowToken, expiresAt: secondFactorFlow.expiresAt },
			};
		return this.openSession(
			userId,
			flow.remember,
			browser,
			AuthEventTypeEnum.LOGIN_SUCCEEDED,
		);
	}

	// Toute session qui s'ouvre (connexion, inscription, nouveau mot de passe) : remplace celle que ce navigateur avait déjà
	async openSession(
		userId: number,
		remember: boolean,
		browser: BrowserContextBean,
		eventType: AuthEventTypeEnum,
	): Promise<FlowOutcomeBean> {
		const sessionCookie = await sessionService.create({
			userId,
			remember,
			client: browser.client,
			replacedToken: browser.sessionToken,
		});
		await authEventService.record({
			type: eventType,
			userId,
			client: browser.client,
		});
		return { isCompleted: true, sessionCookie, recoveryCodes: null };
	}

	// Le compte a pu fermer la connexion par email depuis l'envoi du mail : le lien et le code ne valent plus
	async #assertStillAcceptsMail(userId: number): Promise<void> {
		const user = await findUserByIdQuery(userId);
		if (
			user === null ||
			!acceptsLoginMethod(user.loginMethods, LoginMethodEnum.MAIL)
		)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"The account no longer accepts mail login",
			);
	}

	/**
	 * Les paramètres d'argon2 ont monté : le hash est refait maintenant, seul moment où le serveur connaît le mot de
	 * passe. Serveur trop occupé : ce sera à la prochaine connexion, celle-ci n'échoue pas pour autant
	 */
	async #rehashIfOutdated(user: User, password: string): Promise<void> {
		if (!passwordService.needsRehash(user.passwordHash)) return;
		try {
			await rehashUserPasswordQuery(
				user.id,
				await passwordService.hash(password),
			);
		} catch (error) {
			if (!(error instanceof ServiceUnavailableError)) throw error;
		}
	}
}

export const loginService = new LoginService();
