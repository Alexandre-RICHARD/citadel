import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
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
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readMailSecrets } from "../../../../testUtils/integration/auth/readMailSecrets.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

const START_EMAIL_CHANGE_URL = `${ApiPrefixEnum.AUTH}/me/email`;
const SUBMIT_CODE_URL = `${ApiPrefixEnum.AUTH}/flow/code`;

function buildNewEmail(): string {
	return `${buildUniqueWord().toLowerCase()}@example.org`;
}

async function startEmailChange(
	body: { password: string; newEmail: string },
	cookie?: string,
) {
	const pending = request(app)
		.post(START_EMAIL_CHANGE_URL)
		.set("X-Real-IP", buildUniqueIp())
		.send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

async function submitCode(code: string, cookie: string) {
	return request(app)
		.post(SUBMIT_CODE_URL)
		.set("X-Real-IP", buildUniqueIp())
		.set("Cookie", cookie)
		.send({ code });
}

async function openConnectedAccount() {
	const account = await insertTestAccount();
	const session = await openTestSession({ userId: account.userId });
	return { account, session };
}

// Le changement commencé, et ce qu'il faut pour le terminer : le code de l'email et les cookies de la session et du parcours
async function startChange() {
	const { account, session } = await openConnectedAccount();
	const newEmail = buildNewEmail();
	const mails = watchSentMails();
	const started = await startEmailChange(
		{ password: account.password, newEmail },
		session.cookie,
	);
	const { code } = readMailSecrets(await mails.waitForOne());
	const cookie = `${session.cookie}; ${readCookieHeader(started, flowCookie.name) ?? ""}`;
	return { account, session, newEmail, mails, code, cookie };
}

describe("startEmailChange", () => {
	describe("200 OK", () => {
		it("SHOULD start the flow and send the code and the link to the new address", async () => {
			// Arrange
			const { account, session } = await openConnectedAccount();
			const newEmail = buildNewEmail();
			const mails = watchSentMails();

			// Act
			const response = await startEmailChange(
				{ password: account.password, newEmail },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as FlowStatusDto).flow?.kind).toBe(
				FlowKindEnum.EMAIL_CHANGE,
			);
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_EMAIL_CHANGE,
				to: { email: newEmail },
			});
			expect((await selectAuthRows.user(account.userId))?.email).toBe(
				account.email,
			);
		});

		it("SHOULD replace the address, warn the old one and keep the session WHEN the code is typed", async () => {
			// Arrange
			const { account, session, newEmail, mails, code, cookie } =
				await startChange();

			// Act
			const response = await submitCode(code, cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body).toStrictEqual({ flow: null });
			expect((await selectAuthRows.user(account.userId))?.email).toBe(newEmail);
			const [, notice] = await mails.waitFor(2);
			expect(notice).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED,
				to: { email: account.email },
			});
			expect(
				(
					await request(app)
						.get(`${ApiPrefixEnum.AUTH}/me`)
						.set("Cookie", session.cookie)
				).status,
			).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{ action: RestoreJournalActionEnum.EMAIL_CHANGED, email: newEmail },
			]);
		});

		it("SHOULD answer the same and only tell the owner WHEN the address belongs to another account", async () => {
			// Arrange
			const { account, session } = await openConnectedAccount();
			const owner = await insertTestAccount();
			const mails = watchSentMails();

			// Act
			const response = await startEmailChange(
				{ password: account.password, newEmail: owner.email.toUpperCase() },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect((response.body as FlowStatusDto).flow?.kind).toBe(
				FlowKindEnum.EMAIL_CHANGE,
			);
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_EMAIL_CHANGE_ADDRESS_TAKEN,
				to: { email: owner.email.toUpperCase() },
			});
			expect(mail.text).not.toMatch(/\d{6}/u);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse and send nothing WHEN the password is wrong", async () => {
			// Arrange
			const { session } = await openConnectedAccount();
			const mails = watchSentMails();

			// Act
			const response = await startEmailChange(
				{ password: "pas le bon mot de passe", newEmail: buildNewEmail() },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			await mails.expectNone();
		});

		it("SHOULD refuse with EMAIL_UNCHANGED and send nothing WHEN the new address is the current one, whatever its case", async () => {
			// Arrange
			const { account, session } = await openConnectedAccount();
			const mails = watchSentMails();

			// Act
			const response = await startEmailChange(
				{ password: account.password, newEmail: account.email.toUpperCase() },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.EMAIL_UNCHANGED,
				message: "The new email is the current one",
			});
			await mails.expectNone();
		});

		it("SHOULD refuse WHEN the new address is not an email", async () => {
			// Arrange
			const { account, session } = await openConnectedAccount();

			// Act
			const response = await startEmailChange(
				{ password: account.password, newEmail: "pas une adresse" },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN the request has no session", async () => {
			// Act
			const response = await startEmailChange({
				password: "x",
				newEmail: buildNewEmail(),
			});

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD keep the old address WHEN the address is taken between the request and the code", async () => {
			// Arrange
			const { account, newEmail, code, cookie } = await startChange();
			await insertAuthRows.user({ email: newEmail });

			// Act
			const response = await submitCode(code, cookie);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER,
			);
			expect(response.body).toMatchObject({
				code: AuthErrorCodeEnum.EMAIL_TAKEN,
			});
			expect((await selectAuthRows.user(account.userId))?.email).toBe(
				account.email,
			);
			expect(await readRestoreJournal(account.userId)).toStrictEqual([]);
		});
	});
});
