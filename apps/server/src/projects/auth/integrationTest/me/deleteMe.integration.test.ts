import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { insertTestRecoveryCodes } from "../../../../testUtils/integration/auth/insertTestRecoveryCodes.ts";
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const DELETE_ME_URL = `${ApiPrefixEnum.AUTH}/me`;
const AUTH_TABLES = [
	"auth_session",
	"auth_flow",
	"auth_factor",
	"auth_recovery_code",
	"auth_event",
] as const;

async function deleteMe(body: object, cookie?: string) {
	const pending = request(app)
		.delete(DELETE_ME_URL)
		.set("X-Real-IP", buildUniqueIp())
		.send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

async function openAccount() {
	const account = await insertTestAccount();
	const session = await openTestSession({ userId: account.userId });
	return { account, session };
}

// Un compte protégé par une application d'authentification, avec ses codes de secours
async function openProtectedAccount() {
	const { account, session } = await openAccount();
	const totp = await insertTestTotpFactor({ userId: account.userId });
	const recoveryCodes = await insertTestRecoveryCodes(account.userId, 2);
	return { account, session, totp, recoveryCodes };
}

describe("deleteMe", () => {
	describe("204 No Content", () => {
		it("SHOULD delete the account with everything it owns, clear the cookie and confirm by mail", async () => {
			// Arrange
			const { account, session } = await openAccount();
			await openTestSession({ userId: account.userId });
			await insertAuthRows.event({ userId: account.userId });
			const stranger = await openTestSession();
			const mails = watchSentMails();

			// Act
			const response = await deleteMe(
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(readSetCookie(response, sessionCookie.name)).toContain(
				`${sessionCookie.name}=;`,
			);
			expect(await selectAuthRows.user(account.userId)).toBeNull();
			const leftRows = await Promise.all(
				AUTH_TABLES.map(async (table) =>
					selectAuthRows.rowIdsByUserId(table, account.userId),
				),
			);
			expect(leftRows.flat()).toStrictEqual([]);
			expect(await selectAuthRows.user(stranger.userId)).not.toBeNull();
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED,
				to: { email: account.email },
			});
		});

		it("SHOULD delete a protected account WHEN a TOTP code comes with the password", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();

			// Act
			const response = await deleteMe(
				{
					password: account.password,
					secondFactor: { method: "totp", code: totp.codeAt() },
				},
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectAuthRows.user(account.userId)).toBeNull();
		});

		it("SHOULD delete a protected account WHEN a recovery code comes with the password", async () => {
			// Arrange
			const { account, session, recoveryCodes } = await openProtectedAccount();

			// Act
			const response = await deleteMe(
				{
					password: account.password,
					secondFactor: { method: "recovery_code", code: recoveryCodes[0] },
				},
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectAuthRows.user(account.userId)).toBeNull();
		});

		it("SHOULD ask nothing more than the password WHEN the only factor is the email one", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await deleteMe(
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD keep the account WHEN the password is wrong", async () => {
			// Arrange
			const { account, session } = await openAccount();
			const mails = watchSentMails();

			// Act
			const response = await deleteMe(
				{ password: "pas le bon mot de passe" },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			expect(await selectAuthRows.user(account.userId)).not.toBeNull();
			await mails.expectNone();
		});

		it("SHOULD keep the account WHEN an authenticator app protects it and no code is given", async () => {
			// Arrange
			const { account, session } = await openProtectedAccount();

			// Act
			const response = await deleteMe(
				{ password: account.password },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toMatchObject({
				code: AuthErrorCodeEnum.SECOND_FACTOR_REQUIRED,
			});
			expect(await selectAuthRows.user(account.userId)).not.toBeNull();
		});

		it("SHOULD keep the account and note the failure WHEN the code is wrong", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();
			const wrongCode = totp.codeAt() === "000000" ? "111111" : "000000";

			// Act
			const response = await deleteMe(
				{
					password: account.password,
					secondFactor: { method: "totp", code: wrongCode },
				},
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toMatchObject({
				code: AuthErrorCodeEnum.INVALID_CODE,
			});
			expect(await selectAuthRows.user(account.userId)).not.toBeNull();
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

		it("SHOULD keep the account WHEN the recovery code is unknown", async () => {
			// Arrange
			const { account, session } = await openProtectedAccount();

			// Act
			const response = await deleteMe(
				{
					password: account.password,
					secondFactor: { method: "recovery_code", code: "AAAAAAAAAA" },
				},
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(await selectAuthRows.user(account.userId)).not.toBeNull();
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await deleteMe({ password: "x" });

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
