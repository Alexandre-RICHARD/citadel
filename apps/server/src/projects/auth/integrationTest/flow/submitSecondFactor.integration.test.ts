import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { insertTestRecoveryCodes } from "../../../../testUtils/integration/auth/insertTestRecoveryCodes.ts";
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const SECOND_FACTOR_URL = `${ApiPrefixEnum.AUTH}/flow/second-factor`;
const MINUTE_MS = 60 * 1000;

type Answer = { method: string; code: string };

async function submitSecondFactor(
	body: Answer,
	cookie?: string,
	ip = buildUniqueIp(),
) {
	const pending = request(app)
		.post(SECOND_FACTOR_URL)
		.set("X-Real-IP", ip)
		.send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Un compte protégé par un TOTP, à l'étape « second facteur » du parcours donné
async function openSecondFactorStep(
	kind: FlowKindEnum = FlowKindEnum.LOGIN,
	{ remember = false }: { remember?: boolean } = {},
) {
	const account = await insertTestAccount();
	const totp = await insertTestTotpFactor({ userId: account.userId });
	const flow = await openTestFlow({
		kind,
		step: FlowStepEnum.SECOND_FACTOR,
		userId: account.userId,
		email: account.email,
		remember,
		hasSecrets: false,
		lastSentAt: null,
	});
	return { account, totp, flow };
}

function expectRejected(
	response: request.Response,
	code: AuthErrorCodeEnum,
	message: string,
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({ code, message });
}

describe("submitSecondFactor", () => {
	describe("200 OK : TOTP", () => {
		it("SHOULD open the session, delete the flow and keep the step of the code WHEN a login gets the right TOTP", async () => {
			// Arrange
			const { account, totp, flow } = await openSecondFactorStep(
				FlowKindEnum.LOGIN,
				{ remember: true },
			);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: totp.codeAt() },
				flow.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, sessionCookie.name)).toContain("Max-Age");
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", account.userId),
			).toHaveLength(1);
			expect(await selectAuthRows.factor(totp.factorId)).toMatchObject({
				lastUsedStep: totp.currentStep(),
				lastUsedAt: expect.any(Date) as Date,
			});
		});

		it.each([
			{ reason: "the previous step", stepOffset: -1 },
			{ reason: "the next step", stepOffset: 1 },
		])(
			"SHOULD accept the code of $reason WHEN the phone clock drifts",
			async ({ stepOffset }) => {
				// Arrange
				const { totp, flow } = await openSecondFactorStep();

				// Act
				const response = await submitSecondFactor(
					{
						method: SecondFactorMethodEnum.TOTP,
						code: totp.codeAt(stepOffset),
					},
					flow.cookie,
				);

				// Assert
				expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			},
		);

		it("SHOULD accept the code of any TOTP of the account WHEN it has several", async () => {
			// Arrange
			const { account, flow } = await openSecondFactorStep();
			const secondTotp = await insertTestTotpFactor({ userId: account.userId });

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: secondTotp.codeAt() },
				flow.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(await selectAuthRows.factor(secondTotp.factorId))?.lastUsedStep,
			).toBe(secondTotp.currentStep());
		});

		it("SHOULD move on to the new password WHEN a password reset gets the right TOTP", async () => {
			// Arrange
			useFakeClock(new Date());
			const { totp, flow } = await openSecondFactorStep(
				FlowKindEnum.PASSWORD_RESET,
			);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: totp.codeAt() },
				flow.cookie,
			);

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({
				flow: {
					kind: FlowKindEnum.PASSWORD_RESET,
					step: FlowStepEnum.NEW_PASSWORD,
					expiresIn: 900,
					resendRetryAfter: null,
					remainingAttempts: 5,
					secondFactorMethods: [],
				},
			});
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect(await selectAuthRows.flow(flow.id)).toMatchObject({
				step: FlowStepEnum.NEW_PASSWORD,
			});
		});
	});

	describe("200 OK : recovery code", () => {
		it("SHOULD open the session and use up the code WHEN a mail login gets a recovery code, in lowercase", async () => {
			// Arrange
			const { account, flow } = await openSecondFactorStep(
				FlowKindEnum.MAIL_LOGIN,
			);
			const [code] = await insertTestRecoveryCodes(account.userId, 2);

			// Act
			const response = await submitSecondFactor(
				{
					method: SecondFactorMethodEnum.RECOVERY_CODE,
					code: (code ?? "").toLowerCase(),
				},
				flow.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(readSetCookie(response, sessionCookie.name)).toBeDefined();
			const codeIds = await selectAuthRows.rowIdsByUserId(
				"auth_recovery_code",
				account.userId,
			);
			const usedCodes = await Promise.all(
				codeIds.map(async (id) => selectAuthRows.recoveryCode(id)),
			);
			expect(usedCodes.filter((row) => row?.usedAt !== null)).toHaveLength(1);
		});
	});

	describe("200 OK : email code", () => {
		it("SHOULD open the session WHEN a login gets the code of the email factor", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.EMAIL, code: flow.code },
				flow.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
			const [factorId] = await selectAuthRows.rowIdsByUserId(
				"auth_factor",
				account.userId,
			);
			expect(
				(await selectAuthRows.factor(factorId ?? 0))?.lastUsedAt,
			).toBeInstanceOf(Date);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a code WHEN it was already used for another login", async () => {
			// Arrange : deux connexions du même compte, le même code
			const { account, totp, flow } = await openSecondFactorStep();
			const otherFlow = await openTestFlow({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId: account.userId,
				email: account.email,
				hasSecrets: false,
				lastSentAt: null,
			});
			const code = totp.codeAt();
			await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code },
				flow.cookie,
			);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code },
				otherFlow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong or already used second factor code",
			);
		});

		it("SHOULD refuse the code WHEN it is two steps away", async () => {
			// Arrange
			const { totp, flow } = await openSecondFactorStep();

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: totp.codeAt(-2) },
				flow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong or already used second factor code",
			);
		});

		it("SHOULD refuse a recovery code WHEN it was already used", async () => {
			// Arrange
			const { account, flow } = await openSecondFactorStep();
			const [code = ""] = await insertTestRecoveryCodes(account.userId, 2);
			const otherFlow = await openTestFlow({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId: account.userId,
				email: account.email,
				hasSecrets: false,
			});
			await submitSecondFactor(
				{ method: SecondFactorMethodEnum.RECOVERY_CODE, code },
				flow.cookie,
			);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.RECOVERY_CODE, code },
				otherFlow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong or already used second factor code",
			);
		});

		it.each([
			{ reason: "a mail login", kind: FlowKindEnum.MAIL_LOGIN },
			{ reason: "a password reset", kind: FlowKindEnum.PASSWORD_RESET },
		])(
			"SHOULD never accept the email code WHEN the step follows $reason",
			async ({ kind }) => {
				// Arrange : le compte a aussi le facteur email, et le parcours un code
				const account = await insertTestAccount({
					confirmedFactorType: "email",
				});
				await insertTestTotpFactor({ userId: account.userId });
				const flow = await openTestFlow({
					kind,
					step: FlowStepEnum.SECOND_FACTOR,
					userId: account.userId,
					email: account.email,
				});

				// Act
				const response = await submitSecondFactor(
					{ method: SecondFactorMethodEnum.EMAIL, code: flow.code },
					flow.cookie,
				);

				// Assert
				expectRejected(
					response,
					AuthErrorCodeEnum.INVALID_CODE,
					"This step does not offer this method",
				);
				expect(await selectAuthRows.flow(flow.id)).not.toBeNull();
			},
		);

		it("SHOULD refuse with FLOW_EXPIRED WHEN the flow waits for its mail, not a second factor", async () => {
			// Arrange
			const account = await insertTestAccount();
			const flow = await openTestFlow({
				kind: FlowKindEnum.MAIL_LOGIN,
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: "123456" },
				flow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"No flow waiting for a second factor in this browser",
			);
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the step is over", async () => {
			// Arrange
			const clock = useFakeClock(new Date());
			const { totp, flow } = await openSecondFactorStep();
			clock.advance(61 * MINUTE_MS);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: totp.codeAt() },
				flow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"No flow waiting for a second factor in this browser",
			);
		});

		it("SHOULD refuse with CODE_ATTEMPTS_EXHAUSTED WHEN every attempt of the email code is used", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId: account.userId,
				email: account.email,
				attempts: 5,
			});

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.EMAIL, code: flow.code },
				flow.cookie,
			);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED,
				"Every attempt of this code is used: a new mail is needed",
			);
		});

		it.each([
			{
				reason: "a TOTP code of 5 digits",
				body: { method: SecondFactorMethodEnum.TOTP, code: "12345" },
				message: "Code should contain 6 digits",
			},
			{
				reason: "a recovery code with a digit outside Base32",
				body: {
					method: SecondFactorMethodEnum.RECOVERY_CODE,
					code: "ABCDE-FGH1J",
				},
				message:
					"Recovery code should contain 10 letters or digits from 2 to 7",
			},
		])("SHOULD refuse $reason", async ({ body, message }) => {
			// Act
			const response = await submitSecondFactor(body);

			// Assert
			expectValidationError(response, [
				{
					path: ["code"],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
					message,
				},
			]);
		});

		it("SHOULD refuse an unknown method", async () => {
			// Act
			const response = await submitSecondFactor({
				method: "sms",
				code: "123456",
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(
				(response.body as { issues: { path: string[] }[] }).issues,
			).toMatchObject([{ path: ["method"] }]);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the account wait 2 s, and note the failure, WHEN a code is wrong", async () => {
			// Arrange
			const { account, totp, flow } = await openSecondFactorStep();
			const ip = buildUniqueIp();
			await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: "000000" },
				flow.cookie,
				ip,
			);

			// Act
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: totp.codeAt() },
				flow.cookie,
				ip,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.headers["retry-after"]).toBe("2");
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
				message: "Wait before trying this account again",
			});
			const eventIds = await selectAuthRows.rowIdsByUserId(
				"auth_event",
				account.userId,
			);
			const events = await Promise.all(
				eventIds.map(async (id) => selectAuthRows.event(id)),
			);
			expect(events.map((event) => event?.type)).toContain(
				"second_factor_failed",
			);
		});

		it("SHOULD count the failures with those of the password WHEN the account keeps failing", async () => {
			// Arrange : 14 mauvais mots de passe, puis un mauvais code
			const clock = useFakeClock(new Date());
			const { account, flow } = await openSecondFactorStep();
			const ip = buildUniqueIp();
			for (let index = 0; index < 14; index++) {
				// eslint-disable-next-line no-await-in-loop
				await request(app)
					.post(`${ApiPrefixEnum.AUTH}/login/password`)
					.set("X-Real-IP", ip)
					.send({
						identifier: account.username,
						password: "pas le bon mot de passe",
						remember: false,
					});
				clock.advance(3000);
			}

			// Act
			await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: "000000" },
				flow.cookie,
				ip,
			);
			clock.advance(3000);
			const response = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.TOTP, code: "000000" },
				flow.cookie,
				ip,
			);

			// Assert : le 15e échec banni le couple compte + IP pour 15 minutes
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(Number(response.headers["retry-after"])).toBeGreaterThan(800);
		});

		it("SHOULD keep counting the wrong codes WHEN the right password is given again between them", async () => {
			// Arrange : 14 mauvais codes, chacun après avoir redonné le bon mot de passe
			const clock = useFakeClock(new Date());
			const { account } = await openSecondFactorStep();
			const ip = buildUniqueIp();
			async function loginThenFail() {
				const login = await request(app)
					.post(`${ApiPrefixEnum.AUTH}/login/password`)
					.set("X-Real-IP", ip)
					.send({
						identifier: account.username,
						password: account.password,
						remember: false,
					});
				const response = await submitSecondFactor(
					{ method: SecondFactorMethodEnum.TOTP, code: "000000" },
					readCookieHeader(login, flowCookie.name),
					ip,
				);
				clock.advance(3000);
				return response;
			}
			for (let index = 0; index < 14; index++)
				// eslint-disable-next-line no-await-in-loop
				await loginThenFail();

			// Act
			await loginThenFail();
			const response = await request(app)
				.post(`${ApiPrefixEnum.AUTH}/login/password`)
				.set("X-Real-IP", ip)
				.send({
					identifier: account.username,
					password: account.password,
					remember: false,
				});

			// Assert : le 15e mauvais code a banni le couple compte + IP, mot de passe compris
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
		});

		it("SHOULD neither count a failure nor use an attempt WHEN the email code is tried before any email was asked", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				userId: account.userId,
				email: account.email,
				hasSecrets: false,
				lastSentAt: null,
			});
			const ip = buildUniqueIp();
			const first = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.EMAIL, code: "123456" },
				flow.cookie,
				ip,
			);

			// Act
			const second = await submitSecondFactor(
				{ method: SecondFactorMethodEnum.EMAIL, code: "123456" },
				flow.cookie,
				ip,
			);

			// Assert : jamais de délai, aucun essai du code consommé
			expectRejected(
				first,
				AuthErrorCodeEnum.INVALID_CODE,
				"No email code was sent at this step",
			);
			expectRejected(
				second,
				AuthErrorCodeEnum.INVALID_CODE,
				"No email code was sent at this step",
			);
			expect((await selectAuthRows.flow(flow.id))?.attempts).toBe(0);
		});
	});
});
