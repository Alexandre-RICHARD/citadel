import type { RecoveryCodesDto } from "@citadel/specs/src/projects/auth/dto/recoveryCodesDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueIp } from "../../../../testUtils/integration/buildUniqueIp.ts";

const REGENERATE_URL = `${ApiPrefixEnum.AUTH}/recovery-codes`;

async function regenerate(password: string, cookie: string) {
	return request(app)
		.post(REGENERATE_URL)
		.set("X-Real-IP", buildUniqueIp())
		.set("Cookie", cookie)
		.send({ password });
}

describe("regenerateRecoveryCodes", () => {
	describe("200 OK", () => {
		it("SHOULD replace every recovery code, used or not, by 10 new ones shown once", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "totp" });
			const session = await openTestSession({ userId: account.userId });
			const oldIds = [
				await insertAuthRows.recoveryCode({ userId: account.userId }),
				await insertAuthRows.recoveryCode({
					userId: account.userId,
					usedAt: new Date(),
				}),
			];

			// Act
			const response = await regenerate(account.password, session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			const { recoveryCodes } = response.body as RecoveryCodesDto;
			expect(recoveryCodes).toHaveLength(10);
			for (const code of recoveryCodes)
				expect(code).toMatch(/^[A-Z2-7]{5}-[A-Z2-7]{5}$/u);
			const newIds = await selectAuthRows.rowIdsByUserId(
				"auth_recovery_code",
				account.userId,
			);
			expect(newIds).toHaveLength(10);
			expect(newIds).not.toContain(oldIds[0]);
			expect(newIds).not.toContain(oldIds[1]);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse with NO_SECOND_FACTOR WHEN the account has no active factor", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await regenerate(account.password, session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.NO_SECOND_FACTOR,
				message: "No second factor to recover",
			});
		});

		it("SHOULD keep the codes WHEN the password is wrong", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "totp" });
			const session = await openTestSession({ userId: account.userId });
			const codeId = await insertAuthRows.recoveryCode({
				userId: account.userId,
			});

			// Act
			const response = await regenerate("pas le bon", session.cookie);

			// Assert
			expect(response.body).toStrictEqual({
				code: AuthErrorCodeEnum.WRONG_PASSWORD,
				message: "Wrong password",
			});
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					account.userId,
				),
			).toStrictEqual([codeId]);
		});
	});
});
