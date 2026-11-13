import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { RegistrationBean } from "../bean/registrationBean.type.ts";
import type { VerifiedFlowBean } from "../bean/verifiedFlowBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { readRegistrationPayload } from "../helper/flow/readRegistrationPayload.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { RegistrationPayload } from "../models/registrationPayload.type.ts";
import { deleteFlowQuery } from "../query/flow/deleteFlowQuery.ts";
import { createUserQuery } from "../query/user/createUserQuery.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { flowService } from "./flowService.ts";
import { loginService } from "./loginService.ts";
import { passwordService } from "./passwordService.ts";
import { userService } from "./userService.ts";

/**
 * L'inscription : aucun compte avant que l'adresse soit prouvée, par le lien ou le code. Le compte attend dans le
 * parcours (pseudo et hash du mot de passe), et la réponse est la même que l'adresse soit nouvelle ou déjà inscrite
 */
class RegistrationService {
	/**
	 * Le pseudo est vérifié avant tout, dans la limite de questions par IP (sinon cette route listerait les pseudos sans
	 * limite). Une inscription qui n'aboutit pas (serveur occupé, limite d'emails) ne compte pas dans celles de l'IP
	 */
	async start(
		registration: RegistrationBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		const { ip } = browser.client;
		await authMailService.assertRegistrationOpen();
		if (
			!registration.isHoneypotFilled &&
			!(await userService.isUsernameAvailable(registration.username, ip))
		)
			throw new ConflictError(
				AuthErrorCodeEnum.USERNAME_TAKEN,
				"The username is already taken",
			);
		const retryAfterMs = authLimiter.claimRegistration(ip);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many registrations from this IP",
				retryAfterMs,
			);

		try {
			const outcome = await flowService.start({
				kind: FlowKindEnum.REGISTRATION,
				userId: null,
				email: registration.email,
				payload: await this.#buildPayload(registration),
				remember: registration.remember,
				durationMs: authSettings.flowDurationMs.registration,
				browser,
			});
			if (!registration.isHoneypotFilled)
				await authEventService.record({
					type: AuthEventTypeEnum.REGISTRATION_STARTED,
					userId: null,
					client: browser.client,
				});
			return outcome;
		} catch (error) {
			authLimiter.releaseRegistration(ip);
			throw error;
		}
	}

	/**
	 * L'adresse est prouvée : le compte est créé avec le pseudo du parcours, ou celui qui le remplace quand il a été pris
	 * entre-temps (409 sinon, et le code reste valable). Puis la session s'ouvre
	 */
	async completeMailStep(
		verified: VerifiedFlowBean,
		browser: BrowserContextBean,
		replacingUsername: string | undefined,
	): Promise<FlowOutcomeBean> {
		const { flow } = verified;
		const { username, passwordHash } = readRegistrationPayload(flow.payload);
		const userId = await flowService.consumeMailStep(
			verified,
			async (transaction) => {
				const createdUserId = await createUserQuery(
					{
						email: flow.email,
						username: replacingUsername ?? username,
						passwordHash,
						createdAt: new Date(),
					},
					transaction,
				);
				await deleteFlowQuery(flow.id, transaction);
				return createdUserId;
			},
		);
		return loginService.openSession(
			userId,
			flow.remember,
			browser,
			AuthEventTypeEnum.REGISTRATION_COMPLETED,
		);
	}

	/**
	 * Le compte qui attend dans le parcours. Le mot de passe est hashé dès maintenant, adresse nouvelle ou non : même
	 * durée de réponse dans les deux cas. Un robot qui a rempli le champ piège n'a pas de compte en attente : son parcours
	 * est un leurre, avec cookie, état et limites d'une vraie inscription, mais ni code, ni lien, ni email
	 */
	async #buildPayload(
		registration: RegistrationBean,
	): Promise<RegistrationPayload | null> {
		if (registration.isHoneypotFilled) return null;
		return {
			username: registration.username,
			passwordHash: await passwordService.hash(registration.password),
		};
	}
}

export const registrationService = new RegistrationService();
