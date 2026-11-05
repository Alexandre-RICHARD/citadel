import type { FactorActivationDto } from "@citadel/specs/src/projects/auth/dto/factorActivationDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { MailKindEnum } from "../../../../mail/mailKind.enum.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { readRestoreJournal } from "../../../../testUtils/integration/auth/readRestoreJournal.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { watchSentMails } from "../../../../testUtils/integration/auth/watchSentMails.ts";
import { expectNotFound } from "../../../../testUtils/integration/expectNotFound.ts";
import { RestoreJournalActionEnum } from "../../enum/restoreJournalAction.enum.ts";

const CONFIRM_TOTP_URL = `${ApiPrefixEnum.AUTH}/factors/totp/confirm`;
const MINUTE_MS = 60 * 1000;

async function confirmTotp(
	body: { factorId: number; code: string },
	cookie: string,
) {
	return request(app).post(CONFIRM_TOTP_URL).set("Cookie", cookie).send(body);
}

// Un compte connecté, et un TOTP qui attend son premier code
async function openPendingTotp() {
	const account = await insertTestAccount();
	const session = await openTestSession({ userId: account.userId });
	const totp = await insertTestTotpFactor({
		userId: account.userId,
		confirmedAt: null,
	});
	return { account, session, totp };
}

describe("confirmTotpFactor", () => {
	describe("200 OK", () => {
		it("SHOULD activate the TOTP, give 10 recovery codes and notify the account WHEN it is its first factor", async () => {
			// Arrange
			const { account, session, totp } = await openPendingTotp();
			const mails = watchSentMails();

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt() },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			const { recoveryCodes } = response.body as FactorActivationDto;
			expect(recoveryCodes).toHaveLength(10);
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					account.userId,
				),
			).toHaveLength(10);
			expect(await selectAuthRows.factor(totp.factorId)).toMatchObject({
				confirmedAt: expect.any(Date) as Date,
				lastUsedStep: totp.currentStep(),
			});
			const mail = await mails.waitForOne();
			expect(mail).toMatchObject({
				kind: MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED,
				to: { email: account.email },
			});
			expect(await readRestoreJournal(account.userId)).toMatchObject([
				{ action: RestoreJournalActionEnum.SECURITY_CHANGED },
			]);
		});

		it("SHOULD keep the recovery codes and give none WHEN the account already had a factor", async () => {
			// Arrange
			const { account, session, totp } = await openPendingTotp();
			await insertAuthRows.factor({
				userId: account.userId,
				confirmedAt: new Date(),
			});
			const codeId = await insertAuthRows.recoveryCode({
				userId: account.userId,
			});

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt() },
				session.cookie,
			);

			// Assert
			expect(response.body as FactorActivationDto).toStrictEqual({
				recoveryCodes: null,
			});
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					account.userId,
				),
			).toStrictEqual([codeId]);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse a wrong code and leave the TOTP waiting", async () => {
			// Arrange
			const { session, totp } = await openPendingTotp();

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt(3) },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.INVALID_CODE,
				message: "Wrong TOTP code",
			});
			expect(
				(await selectAuthRows.factor(totp.factorId))?.confirmedAt,
			).toBeNull();
		});
	});

	describe("404 Not Found", () => {
		it("SHOULD not let an account confirm the TOTP of another", async () => {
			// Arrange
			const { totp } = await openPendingTotp();
			const otherSession = await openTestSession();

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt() },
				otherSession.cookie,
			);

			// Assert
			expectNotFound(
				response,
				AuthErrorCodeEnum.FACTOR_NOT_FOUND,
				"No TOTP of this account waits for its first code",
			);
			expect(
				(await selectAuthRows.factor(totp.factorId))?.confirmedAt,
			).toBeNull();
		});

		it("SHOULD refuse WHEN the TOTP is already active", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });
			const totp = await insertTestTotpFactor({ userId: account.userId });

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt() },
				session.cookie,
			);

			// Assert
			expectNotFound(
				response,
				AuthErrorCodeEnum.FACTOR_NOT_FOUND,
				"No TOTP of this account waits for its first code",
			);
		});

		it("SHOULD refuse WHEN the TOTP waited more than 15 minutes", async () => {
			// Arrange
			const clock = useFakeClock(new Date());
			const { session, totp } = await openPendingTotp();
			clock.advance(16 * MINUTE_MS);

			// Act
			const response = await confirmTotp(
				{ factorId: totp.factorId, code: totp.codeAt() },
				session.cookie,
			);

			// Assert
			expectNotFound(
				response,
				AuthErrorCodeEnum.FACTOR_NOT_FOUND,
				"No TOTP of this account waits for its first code",
			);
		});
	});
});
