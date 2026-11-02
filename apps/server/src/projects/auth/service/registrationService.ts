import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";

import { authSettings } from "../../../configuration/authSettings.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import type { BrowserContextBean } from "../bean/browserContextBean.type.ts";
import type { FlowOutcomeBean } from "../bean/flowOutcomeBean.type.ts";
import type { RegistrationBean } from "../bean/registrationBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { readRegistrationPayload } from "../helper/flow/readRegistrationPayload.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { Flow } from "../models/Flow.ts";
import { deleteFlowQuery } from "../query/flow/deleteFlowQuery.ts";
import { createUserQuery } from "../query/user/createUserQuery.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { flowService } from "./flowService.ts";
import { passwordService } from "./passwordService.ts";
import { sessionService } from "./sessionService.ts";
import { userService } from "./userService.ts";

/**
 * L'inscription : aucun compte avant que l'adresse soit prouvée, par le lien ou le code. Le compte attend dans le
 * parcours (pseudo et hash du mot de passe), et la réponse est la même que l'adresse soit nouvelle ou déjà inscrite
 */
class RegistrationService {
	async start(
		registration: RegistrationBean,
		browser: BrowserContextBean,
	): Promise<FlowOutcomeBean> {
		await authMailService.assertRegistrationOpen();
		if (registration.isHoneypotFilled) return this.#decoyOutcome();

		if (await userService.isUsernameTaken(registration.username))
			throw new ConflictError(
				AuthErrorCodeEnum.USERNAME_TAKEN,
				"The username is already taken",
			);
		const retryAfterMs = authLimiter.claimRegistration(browser.client.ip);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Too many registrations from this IP",
				retryAfterMs,
			);

		// Le mot de passe est hashé dès maintenant, adresse nouvelle ou non : même durée de réponse dans les deux cas
		const passwordHash = await passwordService.hash(registration.password);
		const outcome = await flowService.start({
			kind: FlowKindEnum.REGISTRATION,
			userId: null,
			email: registration.email,
			payload: { username: registration.username, passwordHash },
			remember: registration.remember,
			durationMs: authSettings.flowDurationMs.registration,
			browser,
		});
		await authEventService.record({
			type: AuthEventTypeEnum.REGISTRATION_STARTED,
			userId: null,
			client: browser.client,
		});
		return outcome;
	}

	/**
	 * L'adresse est prouvée : le compte est créé avec le pseudo du parcours, ou celui qui le remplace quand il a été pris
	 * entre-temps (409 sinon, et le code reste valable). Puis la session s'ouvre
	 */
	async completeMailStep(
		flow: Flow,
		browser: BrowserContextBean,
		replacingUsername: string | undefined,
	): Promise<FlowOutcomeBean> {
		const { username, passwordHash } = readRegistrationPayload(flow.payload);
		const userId = await flowService.consumeMailStep(
			flow,
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

		const sessionCookie = await sessionService.create({
			userId,
			remember: flow.remember,
			client: browser.client,
			replacedToken: browser.sessionToken,
		});
		await authEventService.record({
			type: AuthEventTypeEnum.REGISTRATION_COMPLETED,
			userId,
			client: browser.client,
		});
		return { isCompleted: true, sessionCookie };
	}

	// Ce qu'un robot qui a rempli le champ piège reçoit : une inscription en apparence, sans rien en base ni mail
	#decoyOutcome(): FlowOutcomeBean {
		const expiresAt = new Date(
			Date.now() + authSettings.flowDurationMs.registration,
		);
		return {
			isCompleted: false,
			flow: {
				kind: FlowKindEnum.REGISTRATION,
				step: FlowStepEnum.MAIL_CODE,
				expiresAt,
				resendAvailableAt: new Date(
					Date.now() + authSettings.code.resendDelayMs,
				),
				remainingAttempts: authSettings.code.maxAttempts,
			},
			flowCookie: { token: createRandomToken(), expiresAt },
		};
	}
}

export const registrationService = new RegistrationService();
