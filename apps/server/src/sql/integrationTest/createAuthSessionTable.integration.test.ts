import { randomBytes } from "node:crypto";

import {
	DatabaseError,
	ForeignKeyConstraintError,
	UniqueConstraintError,
} from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";
import { NON_EXISTENT_ID } from "../../testUtils/integration/nonExistentId.ts";

// La migration V015
describe("createAuthSessionTable", () => {
	describe("token hash", () => {
		it("SHOULD keep the hash byte for byte WHEN a session is created", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const tokenHash = randomBytes(32);

			// Act
			const id = await insertAuthRows.session({ userId, tokenHash });

			// Assert
			expect((await selectAuthRows.session(id))?.tokenHash).toStrictEqual(
				tokenHash,
			);
		});

		it("SHOULD refuse a session WHEN another one already has its hash", async () => {
			// Arrange
			const tokenHash = randomBytes(32);
			await insertAuthRows.session({
				userId: await insertAuthRows.user(),
				tokenHash,
			});

			// Act
			const insertion = insertAuthRows.session({
				userId: await insertAuthRows.user(),
				tokenHash,
			});

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});
	});

	describe("expiration", () => {
		it("SHOULD refuse a session WHEN it would expire after its absolute expiration", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const absoluteExpiresAt = new Date("2026-12-01T00:00:00.000Z");

			// Act
			const insertion = insertAuthRows.session({
				userId,
				expiresAt: new Date(absoluteExpiresAt.getTime() + 1),
				absoluteExpiresAt,
			});

			// Assert
			await expect(insertion).rejects.toThrow(DatabaseError);
		});

		it("SHOULD accept a session WHEN it expires exactly at its absolute expiration", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const absoluteExpiresAt = new Date("2026-12-01T00:00:00.000Z");

			// Act
			const id = await insertAuthRows.session({
				userId,
				expiresAt: absoluteExpiresAt,
				absoluteExpiresAt,
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", userId),
			).toStrictEqual([id]);
		});
	});

	describe("owner", () => {
		it("SHOULD delete only the sessions of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			await insertAuthRows.session({ userId: deletedUserId });
			await insertAuthRows.session({ userId: deletedUserId });
			const otherSessionId = await insertAuthRows.session({
				userId: otherUserId,
			});

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", deletedUserId),
			).toStrictEqual([]);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_session", otherUserId),
			).toStrictEqual([otherSessionId]);
		});

		it("SHOULD refuse a session WHEN its account does not exist", async () => {
			// Act
			const insertion = insertAuthRows.session({ userId: NON_EXISTENT_ID });

			// Assert
			await expect(insertion).rejects.toThrow(ForeignKeyConstraintError);
		});
	});
});
