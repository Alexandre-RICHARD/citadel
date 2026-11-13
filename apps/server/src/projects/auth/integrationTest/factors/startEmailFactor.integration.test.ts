import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { mailService } from "../../../../mail/mailService.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readCookieHeader } from "../../../../testUtils/integration/auth/readCookieHeader.ts";
import { readMailSecrets } from "../../../../testUtils/integration/auth/readMailSecrets.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

const START_EMAIL_FACTOR_URL = `${ApiPrefixEnum.AUTH}/factors/email`;
const SUBMIT_CODE_URL = `${ApiPrefixEnum.AUTH}/flow/code`;

async function startEmailFactor(cookie: string) {
	return request(app)
		.post(START_EMAIL_FACTOR_URL)
		.set("X-Real-IP", buildUniqueIp())
		.set("Cookie", cookie);
}

// Un compte connecté, l'activation commencée, et le code de son email
async function startActivation(confirmedFactorType?: "totp") {
	const account = await insertTestAccount({ confirmedFactorType });
	const session = await openTestSession({ userId: account.userId });
	const mails = watchSentMails();
	const response = await startEmailFactor(session.cookie);
	const { code } = readMailSecrets(await mails.waitForOne());
	const cookie = `${session.cookie}; ${readCookieHeader(response, flowCookie.name) ?? ""}`;
	return { account, cookie, code };
}

describe("startEmailFactor", () => {
	describe("200 OK", () => {
		it("SHOULD start the activation flow and send its mail to the address of the account", async () => {
			// Arrange
			useFakeClock(new Date());
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			const mails = watchSentMails();

			// Act
			const response = await startEmailFactor(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({
				flow: {
					kind: FlowKindEnum.EMAIL_FACTOR,
					step: FlowStepEnum.MAIL_CODE,
					expiresIn: 900,
					resendRetryAfter: 60,
					remainingAttempts: 5,
					secondFactorMethods: [],
				},
			});
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Max-Age=900;",
			);
			expect(await mails.waitForOne()).toMatchObject({
				kind: MailKindEnum.AUTH_EMAIL_FACTOR_ACTIVATION,
				to: { email: account.email },
			});
		});

		it("SHOULD activate the email factor, give the recovery codes and keep the session WHEN its code is validated", async () => {
			// Arrange
			const { account, cookie, code } = await startActivation();
			const mails = watchSentMails();

			// Act
			const response = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", cookie)
				.send({ code });

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			const status = response.body as FlowStatusDto;
			expect(status.flow).toBeNull();
			expect(status.recoveryCodes).toHaveLength(10);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
			const [factorId] = await selectAuthRows.rowIdsByUserId(
				"auth_factor",
				account.userId,
			);
			expect(await selectAuthRows.factor(factorId ?? 0)).toMatchObject({
				type: "email",
				name: "Code par email",
				confirmedAt: expect.any(Date) as Date,
			});
			expect(
				await selectAuthRows.rowIdsByUserId("auth_flow", account.userId),
			).toStrictEqual([]);
			expect((await mails.waitForOne()).kind).toBe(
				MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED,
			);
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{ action: RestoreJournalActionEnum.SECURITY_CHANGED },
			]);
		});

		it("SHOULD give no recovery code WHEN the account already had a TOTP", async () => {
			// Arrange
			const { cookie, code } = await startActivation("totp");

			// Act
			const response = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", cookie)
				.send({ code });

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
		});
	});

	describe("403 Forbidden", () => {
		it("SHOULD refuse with MAIL_CLOSED WHEN the daily quota is used up", async () => {
			// Arrange
			const session = await openTestSession();
			vi.spyOn(mailService, "getStatus").mockResolvedValue({
				isRegistrationOpen: false,
				isContactOpen: false,
				isSendingOpen: false,
			});

			// Act
			const response = await startEmailFactor(session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.FORBIDDEN);
			expect((response.body as { code: string }).code).toBe(
				AuthErrorCodeEnum.MAIL_CLOSED,
			);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse WHEN the account already has its email factor", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await startEmailFactor(session.cookie);

			// Assert
			expectConflict(
				response,
				AuthErrorCodeEnum.EMAIL_FACTOR_ALREADY_ACTIVE,
				"The account already has its email factor",
			);
		});

		it("SHOULD refuse the second activation, with a clear code, WHEN two tabs activated it at once", async () => {
			// Arrange : deux onglets, deux navigateurs pour le serveur (un parcours chacun)
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			const mails = watchSentMails();
			const first = await startEmailFactor(session.cookie);
			const second = await startEmailFactor(session.cookie);
			const [firstMail, secondMail] = await mails.waitFor(2);
			if (firstMail === undefined || secondMail === undefined)
				throw new Error("Two activation mails expected");
			const firstCookie = `${session.cookie}; ${readCookieHeader(first, flowCookie.name) ?? ""}`;
			const secondCookie = `${session.cookie}; ${readCookieHeader(second, flowCookie.name) ?? ""}`;
			await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", firstCookie)
				.send({ code: readMailSecrets(firstMail).code });

			// Act
			const response = await request(app)
				.post(SUBMIT_CODE_URL)
				.set("Cookie", secondCookie)
				.send({ code: readMailSecrets(secondMail).code });

			// Assert
			expectConflict(
				response,
				AuthErrorCodeEnum.EMAIL_FACTOR_ALREADY_ACTIVE,
				"The account already has its email factor",
			);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_factor", account.userId),
			).toHaveLength(1);
		});
	});
});
