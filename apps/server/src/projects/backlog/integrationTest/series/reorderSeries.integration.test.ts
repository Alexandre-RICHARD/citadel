import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";
import { seedBacklogGame } from "../../../../testUtils/integration/backlog/seedBacklogGame.ts";
import { selectBacklogRows } from "../../../../testUtils/integration/backlog/selectBacklogRows.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";

const SERIES_URL = `${ApiPrefixEnum.BACKLOG}/series`;

function entriesUrl(seriesId: number): string {
	return `${SERIES_URL}/${seriesId}/entries`;
}

describe("reorderSeries", () => {
	describe("200 OK", () => {
		it("SHOULD save the new numbers of every game of the series", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({ name: "Castlevania" });
			const first = await seedBacklogGame({ seriesId, seriesNumber: 1 });
			const second = await seedBacklogGame({ seriesId, seriesNumber: 2 });

			// Act
			const response = await request(app)
				.put(entriesUrl(seriesId))
				.send({
					entries: [
						{ gameId: first.gameId, seriesNumber: 2 },
						{ gameId: second.gameId, seriesNumber: 1.5 },
					],
				});

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(await selectBacklogRows.userGame(first.gameId))?.seriesNumber,
			).toBe(2);
			expect(
				(await selectBacklogRows.userGame(second.gameId))?.seriesNumber,
			).toBe(1.5);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD reject the same number given twice", async () => {
			// Act
			const response = await request(app)
				.put(entriesUrl(42))
				.send({
					entries: [
						{ gameId: 1, seriesNumber: 2 },
						{ gameId: 2, seriesNumber: 2 },
					],
				});

			// Assert
			expectValidationError(response, [
				{
					path: ["entries"],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Entries should not give the same number twice",
				},
			]);
		});
	});

	describe("409 Conflict", () => {
		it("SHOULD refuse entries that are not exactly the games of the series, and change nothing", async () => {
			// Arrange
			const seriesId = await insertBacklogRows.series({ name: "Kirby" });
			const inSeries = await seedBacklogGame({ seriesId, seriesNumber: 1 });
			await seedBacklogGame({ seriesId, seriesNumber: 2 });

			// Act
			const response = await request(app)
				.put(entriesUrl(seriesId))
				.send({ entries: [{ gameId: inSeries.gameId, seriesNumber: 5 }] });

			// Assert
			expectConflict(
				response,
				BacklogErrorCodeEnum.SERIES_ENTRIES_MISMATCH,
				`Entries are not the backlog games of series : ${seriesId}`,
			);
			expect(
				(await selectBacklogRows.userGame(inSeries.gameId))?.seriesNumber,
			).toBe(1);
		});
	});
});
