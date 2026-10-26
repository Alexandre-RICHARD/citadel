import type { SeriesListDto } from "@citadel/specs/src/projects/backlog/dto/series/seriesListDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertBacklogRows } from "../../../../testUtils/integration/backlog/insertBacklogRows.ts";

const SERIES_URL = `${ApiPrefixEnum.BACKLOG}/series`;

describe("getAllSeries", () => {
	describe("200 OK", () => {
		it("SHOULD give every series sorted by name", async () => {
			// Arrange
			const word = `Zq${Math.random().toString(36).slice(2, 8)}`;
			const secondId = await insertBacklogRows.series({ name: `${word} B` });
			const firstId = await insertBacklogRows.series({ name: `${word} A` });

			// Act
			const response = await request(app).get(SERIES_URL);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(
				(response.body as SeriesListDto).series.filter(({ name }) =>
					name.startsWith(word),
				),
			).toStrictEqual([
				{ id: firstId, name: `${word} A` },
				{ id: secondId, name: `${word} B` },
			]);
		});
	});
});
