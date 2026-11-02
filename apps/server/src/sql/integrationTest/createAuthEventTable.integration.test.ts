import { ForeignKeyConstraintError, QueryTypes } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";
import { NON_EXISTENT_ID } from "../../testUtils/integration/nonExistentId.ts";

// La migration V019
async function existsEvent(id: number): Promise<boolean> {
	const row = await sequelize.query<{ id: number }>(
		"SELECT id FROM auth_event WHERE id = :id",
		{ type: QueryTypes.SELECT, plain: true, replacements: { id } },
	);
	return row !== null;
}

describe("createAuthEventTable", () => {
	describe("account", () => {
		it("SHOULD accept an event WHEN no account was found", async () => {
			// Act
			const id = await insertAuthRows.event({ userId: null });

			// Assert
			expect(await existsEvent(id)).toBe(true);
		});

		it("SHOULD refuse an event WHEN its account does not exist", async () => {
			// Act
			const insertion = insertAuthRows.event({ userId: NON_EXISTENT_ID });

			// Assert
			await expect(insertion).rejects.toThrow(ForeignKeyConstraintError);
		});

		it("SHOULD delete only the events of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			await insertAuthRows.event({ userId: deletedUserId });
			const otherEventId = await insertAuthRows.event({ userId: otherUserId });
			const anonymousEventId = await insertAuthRows.event({ userId: null });

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_event", deletedUserId),
			).toStrictEqual([]);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_event", otherUserId),
			).toStrictEqual([otherEventId]);
			expect(await existsEvent(anonymousEventId)).toBe(true);
		});
	});
});
