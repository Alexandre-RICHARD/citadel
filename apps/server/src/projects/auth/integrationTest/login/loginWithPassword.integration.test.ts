import { hashPassword } from "@citadel/common/src/node/password/hashPassword.ts";
import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";
import { passwordService } from "../../service/passwordService.ts";

const LOGIN_URL = `${ApiPrefixEnum.AUTH}/login/password`;
const SECOND_MS = 1000;

type LoginBody = { identifier: string; password: string; remember: boolean };

async function login(
	body: LoginBody,
	{ ip = buildUniqueIp(), cookie }: { ip?: string; cookie?: string } = {},
) {
	const pending = request(app).post(LOGIN_URL).set("X-Real-IP", ip).send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

function expectInvalidCredentials(response: request.Response): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION);
	expect(response.body).toStrictEqual({
		code: AuthErrorCodeEnum.INVALID_CREDENTIALS,
		message: "Unknown identifier or wrong password",
	});
}

describe("loginWithPassword", () => {
	describe("200 OK", () => {
		it.each([
			{
				reason: "its username",
				identifierOf: (account: { username: string }) => account.username,
			},
			{
				reason: "its email in another case",
				identifierOf: (account: { email: string }) =>
					account.email.toUpperCase(),
			},
		])(
			"SHOULD open the session and note the login WHEN the account gives $reason and its password",
			async ({ identifierOf }) => {
				// Arrange
				const account = await insertTestAccount();

				// Act
				const response = await login({
					identifier: identifierOf(account),
					password: account.password,
					remember: false,
				});

				// Assert
				expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
				expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
				const setCookie = readSetCookie(response, sessionCookie.name);
				expect(setCookie).toContain("HttpOnly");
				expect(setCookie).not.toContain("Max-Age");
				expect(
					(await selectAuthRows.user(account.userId))?.lastLoginAt,
				).toBeInstanceOf(Date);
				expect(
					await selectAuthRows.rowIdsByUserId("auth_session", account.userId),
				).toHaveLength(1);
			},
		);

		it("SHOULD replace the session the browser already had WHEN it logs in again", async () => {
			// Arrange
			const account = await insertTestAccount();
			const oldSession = await openTestSession({ userId: account.userId });
			const [oldSessionId] = await selectAuthRows.rowIdsByUserId(
				"auth_session",
				account.userId,
			);

			// Act
			await login(
				{
					identifier: account.username,
					password: account.password,
					remember: true,
				},
				{ cookie: oldSession.cookie },
			);

			// Assert
			const sessionIds = await selectAuthRows.rowIdsByUserId(
				"auth_session",
				account.userId,
			);
			expect(sessionIds).toHaveLength(1);
			expect(sessionIds).not.toContain(oldSessionId);
		});

		it("SHOULD start the second factor step, without any session, WHEN the account has a second factor", async () => {
			// Arrange
			useFakeClock(new Date());
			const account = await insertTestAccount({ confirmedFactorType: "email" });

			// Act
			const response = await login({
				identifier: account.username,
				password: account.password,
				remember: true,
			});

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({
				flow: {
					kind: FlowKindEnum.LOGIN,
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
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", account.userId),
			).toStrictEqual([]);
			const [flowId] = await selectAuthRows.rowIdsByUserId(
				"auth_flow",
				account.userId,
			);
			expect(await selectAuthRows.flow(flowId ?? 0)).toMatchObject({
				kind: "login",
				remember: 1,
			});
		});

		it("SHOULD accept the old hash and replace it with one of the current parameters WHEN the argon2 parameters changed", async () => {
			// Arrange : un hash à 2 passes, .env.test en demande 1
			const password = "un ancien mot de passe";
			const oldHash = await hashPassword(password, {
				memoryKib: 64,
				passes: 2,
				parallelism: 1,
			});
			const userId = await insertAuthRows.user({ passwordHash: oldHash });
			const user = await selectAuthRows.user(userId);
			const passwordChangedAt = user?.passwordChangedAt;

			// Act
			const response = await login({
				identifier: user?.username ?? "",
				password,
				remember: false,
			});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const rehashedUser = await selectAuthRows.user(userId);
			expect(rehashedUser?.passwordHash).toMatch(/^argon2id:m=64,t=1,p=1:/u);
			expect(
				passwordService.needsRehash(rehashedUser?.passwordHash ?? ""),
			).toBe(false);
			expect(rehashedUser?.passwordChangedAt).toStrictEqual(passwordChangedAt);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD give the same answer WHEN the identifier is unknown and WHEN the password is wrong", async () => {
			// Arrange
			const account = await insertTestAccount();

			// Act
			const unknown = await login({
				identifier: "personne-ici",
				password: account.password,
				remember: false,
			});
			const wrong = await login({
				identifier: account.username,
				password: "pas le bon mot de passe",
				remember: false,
			});

			// Assert
			expectInvalidCredentials(unknown);
			expectInvalidCredentials(wrong);
		});

		it("SHOULD refuse the right password like a wrong one WHEN the account only accepts mail logins", async () => {
			// Arrange
			const account = await insertTestAccount({ loginMethods: "mail" });

			// Act
			const response = await login({
				identifier: account.username,
				password: account.password,
				remember: false,
			});

			// Assert
			expectInvalidCredentials(response);
		});

		it("SHOULD log the failure for the account, without the password", async () => {
			// Arrange
			const account = await insertTestAccount();

			// Act
			await login({
				identifier: account.username,
				password: "pas le bon mot de passe",
				remember: false,
			});

			// Assert
			const [eventId] = await selectAuthRows.rowIdsByUserId(
				"auth_event",
				account.userId,
			);
			expect(await selectAuthRows.event(eventId ?? 0)).toMatchObject({
				type: "login_failed",
			});
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the account wait 2 seconds from this IP, then accept it again, WHEN an attempt failed", async () => {
			// Arrange
			const clock = useFakeClock();
			const ip = buildUniqueIp();
			const account = await insertTestAccount();
			await login(
				{
					identifier: account.username,
					password: "faux mot de passe",
					remember: false,
				},
				{ ip },
			);

			// Act
			const tooSoon = await login(
				{
					identifier: account.email,
					password: account.password,
					remember: false,
				},
				{ ip },
			);
			const fromPhone = await login({
				identifier: account.username,
				password: account.password,
				remember: false,
			});
			clock.advance(2 * SECOND_MS);
			const afterDelay = await login(
				{
					identifier: account.username,
					password: account.password,
					remember: false,
				},
				{ ip },
			);

			// Assert
			expect(tooSoon.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(tooSoon.headers["retry-after"]).toBe("2");
			expect(tooSoon.body).toStrictEqual({
				code: AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
				message: "Wait before trying this account again",
			});
			expect(fromPhone.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(afterDelay.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});

		it("SHOULD ban the account from this IP for 15 minutes WHEN it failed 15 times", async () => {
			// Arrange
			const clock = useFakeClock();
			const ip = buildUniqueIp();
			const account = await insertTestAccount();
			for (let index = 0; index < 15; index++) {
				// eslint-disable-next-line no-await-in-loop
				await login(
					{ identifier: account.username, password: "faux", remember: false },
					{ ip },
				);
				clock.advance(2 * SECOND_MS);
			}

			// Act
			const response = await login(
				{
					identifier: account.username,
					password: account.password,
					remember: false,
				},
				{ ip },
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(Number(response.headers["retry-after"])).toBe(15 * 60 - 2);
		});
	});
});
