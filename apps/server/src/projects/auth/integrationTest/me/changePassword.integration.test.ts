import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";
import { passwordService } from "../../service/passwordService.ts";

const CHANGE_PASSWORD_URL = `${ApiPrefixEnum.AUTH}/me/password`;
const NEW_PASSWORD = "un tout nouveau mot de passe";

async function changePassword(
	body: { currentPassword: string; newPassword: string },
	cookie?: string,
	ip = buildUniqueIp(),
) {
	const pending = request(app)
		.post(CHANGE_PASSWORD_URL)
		.set("X-Real-IP", ip)
		.send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

async function openAccountWithTwoSessions() {
	const account = await insertTestAccount();
	const here = await openTestSession({ userId: account.userId });
	const phone = await openTestSession({ userId: account.userId });
	return { account, here, phone };
}

describe("changePassword", () => {
	describe("204 No Content", () => {
		it("SHOULD replace the password, close the other sessions, keep this one and warn the account", async () => {
			// Arrange
			const { account, here, phone } = await openAccountWithTwoSessions();
			const mails = watchSentMails();

			// Act
			const response = await changePassword(
				{ currentPassword: account.password, newPassword: NEW_PASSWORD },
				here.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
			const user = await selectAuthRows.user(account.userId);
			expect(
				await passwordService.verify(NEW_PASSWORD, user?.passwordHash ?? null),
			).toBe(true);
			const sessionIds = await selectAuthRows.rowIdsByUserId(
				"auth_session",
				account.userId,
			);
			expect(sessionIds).toHaveLength(1);
			expect(
				(
					await request(app)
						.get(`${ApiPrefixEnum.AUTH}/me`)
						.set("Cookie", here.cookie)
				).status,
			).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(
					await request(app)
						.get(`${ApiPrefixEnum.AUTH}/me`)
						.set("Cookie", phone.cookie)
				).status,
			).toBe(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION);
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED,
				to: { email: account.email },
			});
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{ action: RestoreJournalActionEnum.SECURITY_CHANGED },
			]);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse and keep everything WHEN the current password is wrong", async () => {
			// Arrange
			const { account, here, phone } = await openAccountWithTwoSessions();
			const before = await selectAuthRows.user(account.userId);

			// Act
			const response = await changePassword(
				{
					currentPassword: "pas le bon mot de passe",
					newPassword: NEW_PASSWORD,
				},
				here.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			expect((await selectAuthRows.user(account.userId))?.passwordHash).toBe(
				before?.passwordHash,
			);
			expect(
				(
					await request(app)
						.get(`${ApiPrefixEnum.AUTH}/me`)
						.set("Cookie", phone.cookie)
				).status,
			).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(await readRestoreJournal(account.userId)).toStrictEqual([]);
		});

		it("SHOULD refuse WHEN the new password is the current one", async () => {
			// Arrange
			const { account, here } = await openAccountWithTwoSessions();
			const mails = watchSentMails();

			// Act
			const response = await changePassword(
				{ currentPassword: account.password, newPassword: account.password },
				here.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.PASSWORD_UNCHANGED,
				message: "The new password is the current one",
			});
			await mails.expectNone();
		});

		it("SHOULD refuse WHEN the new password is too short", async () => {
			// Arrange
			const { account, here } = await openAccountWithTwoSessions();

			// Act
			const response = await changePassword(
				{ currentPassword: account.password, newPassword: "trop court" },
				here.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(JSON.stringify(response.body)).toContain(
				ValidationIssueCodeEnum.TOO_SHORT,
			);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await changePassword({
				currentPassword: "n'importe lequel",
				newPassword: NEW_PASSWORD,
			});

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});

	describe("429 Too Many Requests", () => {
		it("SHOULD make the next try wait WHEN the current password was wrong", async () => {
			// Arrange
			const { account, here } = await openAccountWithTwoSessions();
			const ip = buildUniqueIp();
			await changePassword(
				{ currentPassword: "faux", newPassword: NEW_PASSWORD },
				here.cookie,
				ip,
			);

			// Act
			const response = await changePassword(
				{ currentPassword: account.password, newPassword: NEW_PASSWORD },
				here.cookie,
				ip,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS);
			expect(response.headers["retry-after"]).toBeDefined();
		});
	});
});
