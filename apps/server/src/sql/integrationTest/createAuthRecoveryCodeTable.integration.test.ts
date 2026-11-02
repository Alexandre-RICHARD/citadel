import { randomBytes } from "node:crypto";

import { QueryTypes, UniqueConstraintError } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";

// La migration V018
describe("createAuthRecoveryCodeTable", () => {
	describe("code hash", () => {
		it("SHOULD create the code unused WHEN it is inserted", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const codeHash = randomBytes(32);

			// Act
			const id = await insertAuthRows.recoveryCode({ userId, codeHash });

			// Assert
			const row = await sequelize.query<{
				codeHash: Buffer;
				usedAt: Date | null;
			}>(
				"SELECT code_hash AS codeHash, used_at AS usedAt FROM auth_recovery_code WHERE id = :id",
				{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
			);
			expect(row).toStrictEqual({ codeHash, usedAt: null });
		});

		it("SHOULD refuse a code WHEN the account already has the same one", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const codeHash = randomBytes(32);
			await insertAuthRows.recoveryCode({ userId, codeHash });

			// Act
			const insertion = insertAuthRows.recoveryCode({ userId, codeHash });

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});

		it("SHOULD accept the same code WHEN it belongs to two accounts", async () => {
			// Arrange
			const codeHash = randomBytes(32);
			const firstUserId = await insertAuthRows.user();
			const secondUserId = await insertAuthRows.user();
			await insertAuthRows.recoveryCode({ userId: firstUserId, codeHash });

			// Act
			const id = await insertAuthRows.recoveryCode({
				userId: secondUserId,
				codeHash,
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_recovery_code", secondUserId),
			).toStrictEqual([id]);
		});
	});

	describe("owner", () => {
		it("SHOULD delete only the codes of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			await insertAuthRows.recoveryCode({ userId: deletedUserId });
			await insertAuthRows.recoveryCode({ userId: deletedUserId });
			const otherCodeId = await insertAuthRows.recoveryCode({
				userId: otherUserId,
			});

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId(
					"auth_recovery_code",
					deletedUserId,
				),
			).toStrictEqual([]);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_recovery_code", otherUserId),
			).toStrictEqual([otherCodeId]);
		});
	});
});
