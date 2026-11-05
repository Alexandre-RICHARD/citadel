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
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

async function deleteFactor(
	factorId: number,
	password: string,
	cookie: string,
	ip = buildUniqueIp(),
) {
	return request(app)
		.delete(`${ApiPrefixEnum.AUTH}/factors/${factorId}`)
		.set("X-Real-IP", ip)
		.set("Cookie", cookie)
		.send({ password });
}

// Un compte connecté au mot de passe connu, protégé par un TOTP, avec ses codes de secours
async function openProtectedAccount() {
	const account = await insertTestAccount();
	const session = await openTestSession({ userId: account.userId });
	const totp = await insertTestTotpFactor({ userId: account.userId });
	await insertAuthRows.recoveryCode({ userId: account.userId });
	return { account, session, totp };
}

describe("deleteFactor", () => {
	describe("204 No Content", () => {
		it("SHOULD remove the last factor with the recovery codes, and notify the account", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();
			const mails = watchSentMails();

			// Act
			const response = await deleteFactor(
				totp.factorId,
				account.password,
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			expect(await selectAuthRows.factor(totp.factorId)).toBeNull();
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					account.userId,
				),
			).toStrictEqual([]);
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_REMOVED,
				to: { email: account.email },
			});
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{ action: RestoreJournalActionEnum.SECURITY_CHANGED },
			]);
		});

		it("SHOULD keep the recovery codes WHEN another factor remains", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();
			await insertAuthRows.factor({
				userId: account.userId,
				confirmedAt: new Date(),
			});

			// Act
			await deleteFactor(totp.factorId, account.password, session.cookie);

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					account.userId,
				),
			).toHaveLength(1);
		});

		it("SHOULD notify nothing WHEN the TOTP still waited for its first code", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			const pending = await insertTestTotpFactor({
				userId: account.userId,
				confirmedAt: null,
			});
			const mails = watchSentMails();

			// Act
			const response = await deleteFactor(
				pending.factorId,
				account.password,
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			await mails.expectNone();
			expect(await readRestoreJournal(account.userId)).toStrictEqual([]);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD keep the factor and note the failure WHEN the password is wrong", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();

			// Act
			const response = await deleteFactor(
				totp.factorId,
				"pas le bon mot de passe",
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			expect(await selectAuthRows.factor(totp.factorId)).not.toBeNull();
			const eventIds = await selectAuthRows.rowIdsByUserId(
				"auth_event",
				account.userId,
			);
			const events = await Promise.all(
				eventIds.map(async (id) => selectAuthRows.event(id)),
			);
			expect(events.map((event) => event?.type)).toContain(
				"password_confirmation_failed",
			);
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD never remove the factor of another account", async () => {
			// Arrange
			const { totp } = await openProtectedAccount();
			const intruder = await insertTestAccount();
			const intruderSession = await openTestSession({
				userId: intruder.userId,
			});

			// Act
			const response = await deleteFactor(
				totp.factorId,
				intruder.password,
				intruderSession.cookie,
			);

			// Assert
			expectNotFound(
				response,
				AuthErrorCodeEnum.FACTOR_NOT_FOUND,
				"No factor of this account has this id",
			);
			expect(await selectAuthRows.factor(totp.factorId)).not.toBeNull();
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the account wait 2 s WHEN the password was just wrong", async () => {
			// Arrange
			const { account, session, totp } = await openProtectedAccount();
			const ip = buildUniqueIp();
			await deleteFactor(totp.factorId, "pas le bon", session.cookie, ip);

			// Act
			const response = await deleteFactor(
				totp.factorId,
				account.password,
				session.cookie,
				ip,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
				message: "Wait before trying this password again",
			});
		});
	});
});
