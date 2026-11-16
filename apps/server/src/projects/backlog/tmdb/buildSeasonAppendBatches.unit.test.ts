import { describe, expect, it } from "vitest";

import { buildSeasonAppendBatches } from "./buildSeasonAppendBatches.ts";

describe("buildSeasonAppendBatches.ts", () => {
	describe("batches", () => {
		it("SHOULD read every season in one batch WHEN there are at most 20", () => {
			expect(buildSeasonAppendBatches([0, 1, 2])).toStrictEqual([
				"season/0,season/1,season/2",
			]);
		});

		it("SHOULD split the seasons by 20 WHEN there are more", () => {
			const batches = buildSeasonAppendBatches(
				Array.from({ length: 21 }, (_, index) => index + 1),
			);

			expect(batches.map((batch) => batch.split(",").length)).toStrictEqual([
				20, 1,
			]);
			expect(batches[1]).toBe("season/21");
		});

		it("SHOULD give no batch WHEN the show has no season", () => {
			expect(buildSeasonAppendBatches([])).toStrictEqual([]);
		});
	});
});
