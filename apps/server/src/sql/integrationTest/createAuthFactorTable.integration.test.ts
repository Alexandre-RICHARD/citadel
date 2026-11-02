import { randomBytes } from "node:crypto";

import { DatabaseError, QueryTypes } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";

// La migration V017
const TOTP_STEP_SECONDS = 30;

describe("createAuthFactorTable", () => {
	describe("accepted factors", () => {
		it("SHOULD accept a TOTP factor WHEN it has a secret and its key version", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			const id = await insertAuthRows.factor({
				userId,
				type: "totp",
				secretEncrypted: randomBytes(48),
				keyVersion: 255,
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_factor", userId),
			).toStrictEqual([id]);
		});

		it("SHOULD accept a TOTP factor without secret WHEN the secret is not encrypted yet", async () => {
			// Arrange
			const userId = await insertAuthRows.user();

			// Act
			const id = await insertAuthRows.factor({ userId, type: "totp" });

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_factor", userId),
			).toStrictEqual([id]);
		});

		it("SHOULD keep the last used step WHEN it is the step of the end of year 3999", async () => {
			// Arrange
			const lastUsedStep = Math.floor(
				Date.parse("3999-12-31T23:59:59.000Z") / 1000 / TOTP_STEP_SECONDS,
			);

			// Act
			const id = await insertAuthRows.factor({
				userId: await insertAuthRows.user(),
				type: "totp",
				lastUsedStep,
			});

			// Assert
			const row = await sequelize.query<{ lastUsedStep: number }>(
				"SELECT last_used_step AS lastUsedStep FROM auth_factor WHERE id = :id",
				{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
			);
			expect(row?.lastUsedStep).toBe(lastUsedStep);
		});
	});

	describe("rejected factors", () => {
		it.each([
			{
				reason: "an email factor has a secret",
				columns: { secretEncrypted: randomBytes(48), keyVersion: 1 },
			},
			{
				reason: "an email factor has a last used step",
				columns: { lastUsedStep: 1 },
			},
		])("SHOULD refuse the factor WHEN $reason", async ({ columns }) => {
			// Act
			const insertion = insertAuthRows.factor({
				userId: await insertAuthRows.user(),
				type: "email",
				...columns,
			});

			// Assert
			await expect(insertion).rejects.toThrow(DatabaseError);
		});

		it.each([
			{
				reason: "the secret has no key version",
				columns: { secretEncrypted: randomBytes(48), keyVersion: null },
			},
			{
				reason: "the key version has no secret",
				columns: { secretEncrypted: null, keyVersion: 1 },
			},
			{
				reason: "the key version is 0",
				columns: { secretEncrypted: randomBytes(48), keyVersion: 0 },
			},
			{
				reason: "the key version is above 255",
				columns: { secretEncrypted: randomBytes(48), keyVersion: 256 },
			},
		])("SHOULD refuse a TOTP factor WHEN $reason", async ({ columns }) => {
			// Act
			const insertion = insertAuthRows.factor({
				userId: await insertAuthRows.user(),
				type: "totp",
				...columns,
			});

			// Assert
			await expect(insertion).rejects.toThrow(DatabaseError);
		});

		it("SHOULD refuse the type WHEN it is neither email nor totp", async () => {
			// Act
			const insertion = insertAuthRows.factor({
				userId: await insertAuthRows.user(),
				type: "sms",
			});

			// Assert
			await expect(insertion).rejects.toThrow(DatabaseError);
		});
	});

	describe("owner", () => {
		it("SHOULD delete only the factors of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			await insertAuthRows.factor({ userId: deletedUserId });
			await insertAuthRows.factor({ userId: deletedUserId, type: "totp" });
			const otherFactorId = await insertAuthRows.factor({
				userId: otherUserId,
			});

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_factor", deletedUserId),
			).toStrictEqual([]);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_factor", otherUserId),
			).toStrictEqual([otherFactorId]);
		});
	});
});
