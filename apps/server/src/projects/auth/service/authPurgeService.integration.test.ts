import { QueryTypes } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../../configuration/sequelize.ts";
import { insertAuthRows } from "../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../testUtils/integration/auth/selectAuthRows.ts";
import { errorLogService } from "../../errorLog/service/errorLogService.ts";
import { authPurgeService } from "./authPurgeService.ts";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
// Maintenant : les lignes encore valables des autres tests restent en base
const NOW = new Date();

function before(milliseconds: number): Date {
	return new Date(NOW.getTime() - milliseconds);
}

function after(milliseconds: number): Date {
	return new Date(NOW.getTime() + milliseconds);
}

async function insertErrorLog(createdAt: Date): Promise<number> {
	const [insertedId] = await sequelize.query(
		`INSERT INTO error_log (error_type, message, stack, created_at)
		VALUES ('Error', '[Test] Purge', NULL, :createdAt)`,
		{ type: QueryTypes.INSERT, replacements: { createdAt } },
	);
	return insertedId;
}

async function errorLogExists(id: number): Promise<boolean> {
	const row = await sequelize.query("SELECT id FROM error_log WHERE id = :id", {
		type: QueryTypes.SELECT,
		plain: true,
		replacements: { id },
	});
	return row !== null;
}

describe("authPurgeService", () => {
	describe("expired rows", () => {
		it("SHOULD delete the sessions that ended and keep the others WHEN the frequent purge runs", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const endedId = await insertAuthRows.session({
				userId,
				expiresAt: NOW,
				absoluteExpiresAt: after(DAY_MS),
			});
			const activeId = await insertAuthRows.session({
				userId,
				expiresAt: after(1),
				absoluteExpiresAt: after(DAY_MS),
			});

			// Act
			await authPurgeService.purgeExpired(NOW);

			// Assert
			expect(await selectAuthRows.session(endedId)).toBeNull();
			expect(await selectAuthRows.session(activeId)).not.toBeNull();
		});

		it("SHOULD delete the flows that ended and keep the others WHEN the frequent purge runs", async () => {
			// Arrange
			const endedId = await insertAuthRows.flow({ expiresAt: before(1) });
			const activeId = await insertAuthRows.flow({ expiresAt: after(1) });

			// Act
			await authPurgeService.purgeExpired(NOW);

			// Assert
			expect(await selectAuthRows.flow(endedId)).toBeNull();
			expect(await selectAuthRows.flow(activeId)).not.toBeNull();
		});

		it("SHOULD delete only the factors left unconfirmed for 15 minutes WHEN the frequent purge runs", async () => {
			// Arrange
			const userId = await insertAuthRows.user();
			const abandonedId = await insertAuthRows.factor({
				userId,
				type: "totp",
				createdAt: before(15 * MINUTE_MS + 1),
			});
			const pendingId = await insertAuthRows.factor({
				userId,
				type: "totp",
				createdAt: before(14 * MINUTE_MS),
			});
			const confirmedId = await insertAuthRows.factor({
				userId,
				createdAt: before(DAY_MS),
				confirmedAt: before(DAY_MS),
			});

			// Act
			await authPurgeService.purgeExpired(NOW);

			// Assert
			expect(await selectAuthRows.factor(abandonedId)).toBeNull();
			expect(await selectAuthRows.factor(pendingId)).not.toBeNull();
			expect(await selectAuthRows.factor(confirmedId)).not.toBeNull();
		});
	});

	describe("old events", () => {
		it("SHOULD delete the events older than 20 days and keep the others WHEN the daily purge runs", async () => {
			// Arrange
			const oldId = await insertAuthRows.event({
				userId: null,
				createdAt: before(20 * DAY_MS + 1),
			});
			const recentId = await insertAuthRows.event({
				userId: null,
				createdAt: before(19 * DAY_MS),
			});

			// Act
			await authPurgeService.purgeOldEvents(NOW);

			// Assert
			expect(await selectAuthRows.event(oldId)).toBeNull();
			expect(await selectAuthRows.event(recentId)).not.toBeNull();
		});

		it("SHOULD delete the server errors older than 20 days and keep the others WHEN the daily purge runs", async () => {
			// Arrange
			const oldId = await insertErrorLog(before(20 * DAY_MS + 1));
			const recentId = await insertErrorLog(before(19 * DAY_MS));

			// Act
			await errorLogService.purge(NOW, 20 * DAY_MS);

			// Assert
			expect(await errorLogExists(oldId)).toBe(false);
			expect(await errorLogExists(recentId)).toBe(true);
		});
	});
});
