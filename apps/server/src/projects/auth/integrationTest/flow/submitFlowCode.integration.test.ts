import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const SUBMIT_CODE_URL = `${ApiPrefixEnum.AUTH}/flow/code`;
const GET_ME_URL = `${ApiPrefixEnum.AUTH}/me`;
const MINUTE_MS = 60 * 1000;
const PASSWORD_HASH = "argon2id:m=64,t=1,p=1:c2Vs:aGFzaA";

async function submitCode(
	body: { code: string; username?: string },
	cookie?: string,
) {
	const pending = request(app).post(SUBMIT_CODE_URL).send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

// Une inscription en attente, avec le compte qu'elle créera
async function openRegistration(options: { remember?: boolean } = {}) {
	const username = buildUniqueWord();
	const flow = await openTestFlow({
		payload: { username, passwordHash: PASSWORD_HASH },
		...options,
	});
	return { ...flow, username };
}

function expectRejected(
	response: request.Response,
	code: AuthErrorCodeEnum,
	message: string,
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({ code, message });
}

describe("submitFlowCode", () => {
	describe("200 OK : registration", () => {
		it("SHOULD create the account, delete the flow and open the session WHEN the code is right", async () => {
			// Arrange : l'horloge figée, la durée du cookie se lit à la seconde près
			useFakeClock(new Date());
			const flow = await openRegistration({ remember: true });

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			const [userId] = await selectAuthRows.userIdsByEmail(flow.email);
			expect(await selectAuthRows.user(userId ?? 0)).toMatchObject({
				email: flow.email,
				username: flow.username,
				passwordHash: PASSWORD_HASH,
				lastLoginAt: expect.any(Date) as Date,
			});
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
			expect(readSetCookie(response, sessionCookie.name)).toContain(
				"Max-Age=604800;",
			);
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
			const me = await request(app)
				.get(GET_ME_URL)
				.set("Cookie", readCookieHeader(response, sessionCookie.name) ?? "");
			expect(me.body).toMatchObject({ username: flow.username });
		});

		it("SHOULD accept the code WHEN it is pasted with spaces", async () => {
			// Arrange
			const flow = await openRegistration();

			// Act
			const response = await submitCode(
				{ code: ` ${flow.code.slice(0, 3)} ${flow.code.slice(3)} ` },
				flow.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD accept the code typed on another device WHEN only the flow cookie travels", async () => {
			// Arrange : la page restée ouverte sur le PC, le code lu sur le téléphone
			const flow = await openRegistration();

			// Act
			const response = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", flow.cookie)
				.set("User-Agent", "Un autre appareil")
				.send({ code: flow.code });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD keep the flow open, the code still valid, WHEN the username was taken in the meantime", async () => {
			// Arrange
			const flow = await openRegistration();
			await insertAuthRows.user({ username: flow.username });

			// Act
			const conflict = await submitCode({ code: flow.code }, flow.cookie);
			const newUsername = buildUniqueWord();
			const retry = await submitCode(
				{ code: flow.code, username: newUsername },
				flow.cookie,
			);

			// Assert
			expectConflict(
				conflict,
				AuthErrorCodeEnum.USERNAME_TAKEN,
				"The username was taken in the meantime",
			);
			expect(retry.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const [userId] = await selectAuthRows.userIdsByEmail(flow.email);
			expect((await selectAuthRows.user(userId ?? 0))?.username).toBe(
				newUsername,
			);
		});

		it("SHOULD replace the session the browser already had WHEN the account is created", async () => {
			// Arrange
			const flow = await openRegistration();
			const oldSession = await openTestSession();

			// Act
			await submitCode(
				{ code: flow.code },
				`${flow.cookie}; ${oldSession.cookie}`,
			);

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", oldSession.userId),
			).toStrictEqual([]);
		});

		it("SHOULD create a single account WHEN the same code is sent twice at once", async () => {
			// Arrange
			const flow = await openRegistration();

			// Act
			const responses = await Promise.all([
				submitCode({ code: flow.code }, flow.cookie),
				submitCode({ code: flow.code }, flow.cookie),
			]);

			// Assert
			expect(responses.map((response) => response.status).sort()).toStrictEqual(
				[
					HttpStatutCodeSuccessEnum.SUCCESS,
					HttpStatutCodeErrorEnum.BAD_REQUEST,
				],
			);
			expect(await selectAuthRows.userIdsByEmail(flow.email)).toHaveLength(1);
		});
	});

	describe("200 OK : mail login", () => {
		it("SHOULD open the session WHEN the account has no TOTP", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: "mail_login",
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, sessionCookie.name)).toBeDefined();
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
		});

		it("SHOULD ask for the TOTP, without any session, WHEN the account has one", async () => {
			// Arrange
			const clock = useFakeClock();
			const account = await insertTestAccount({ confirmedFactorType: "totp" });
			const flow = await openTestFlow({
				kind: "mail_login",
				userId: account.userId,
				email: account.email,
			});
			clock.advance(MINUTE_MS);

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({
				flow: {
					kind: FlowKindEnum.MAIL_LOGIN,
					step: FlowStepEnum.SECOND_FACTOR,
					expiresIn: 600,
					resendRetryAfter: null,
					remainingAttempts: 5,
				},
			});
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Max-Age=600;",
			);
			expect(await selectAuthRows.flow(flow.id)).toMatchObject({
				step: "second_factor",
				codeHmac: null,
				linkTokenHash: null,
			});
		});
	});

	describe("200 OK : password reset", () => {
		it.each([
			{ factor: undefined, step: FlowStepEnum.NEW_PASSWORD },
			{ factor: "email" as const, step: FlowStepEnum.NEW_PASSWORD },
			{ factor: "totp" as const, step: FlowStepEnum.SECOND_FACTOR },
		])(
			"SHOULD move to the $step step WHEN the account second factor is $factor",
			async ({ factor, step }) => {
				// Arrange
				const account = await insertTestAccount({
					confirmedFactorType: factor,
				});
				const flow = await openTestFlow({
					kind: "password_reset",
					userId: account.userId,
					email: account.email,
				});

				// Act
				const response = await submitCode({ code: flow.code }, flow.cookie);

				// Assert
				expect((response.body as FlowStatusDto).flow?.step).toBe(step);
				expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			},
		);
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse with INVALID_CODE and count the attempt WHEN the code is wrong", async () => {
			// Arrange
			const flow = await openRegistration();
			const wrongCode = flow.code === "000000" ? "000001" : "000000";

			// Act
			const response = await submitCode({ code: wrongCode }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong, used or replaced code",
			);
			expect((await selectAuthRows.flow(flow.id))?.attempts).toBe(1);
		});

		it("SHOULD refuse even the right code with CODE_ATTEMPTS_EXHAUSTED WHEN 5 attempts were made", async () => {
			// Arrange
			const flow = await openTestFlow({
				payload: { username: buildUniqueWord(), passwordHash: PASSWORD_HASH },
				attempts: 5,
			});

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED,
				"Every attempt of this code is used: a new mail is needed",
			);
			expect(await selectAuthRows.userIdsByEmail(flow.email)).toStrictEqual([]);
		});

		it("SHOULD refuse any code with INVALID_CODE WHEN the flow is a decoy", async () => {
			// Arrange
			const flow = await openTestFlow({
				kind: "mail_login",
				userId: null,
				hasSecrets: false,
			});

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.INVALID_CODE,
				"Wrong, used or replaced code",
			);
		});

		it("SHOULD refuse with FLOW_EXPIRED, without session, WHEN the account closed mail login since the mail", async () => {
			// Arrange
			const account = await insertTestAccount({ loginMethods: "password" });
			const flow = await openTestFlow({
				kind: "mail_login",
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"The account no longer accepts mail login",
			);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the flow expired", async () => {
			// Arrange
			const clock = useFakeClock();
			const flow = await openTestFlow({
				expiresAt: new Date(Date.now() + MINUTE_MS),
			});
			clock.advance(MINUTE_MS);

			// Act
			const response = await submitCode({ code: flow.code }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"No flow in progress in this browser",
			);
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the browser has no flow cookie", async () => {
			// Act
			const response = await submitCode({ code: "123456" });

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"No flow in progress in this browser",
			);
		});

		it("SHOULD refuse a code WHEN it has 5 digits", async () => {
			// Act
			const response = await submitCode({ code: "12345" });

			// Assert
			expectValidationError(response, [
				{
					path: ["code"],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
					message: "Code should contain 6 digits",
				},
			]);
		});
	});
});
