import { describe, expect, it } from "vitest";

import { isAiredEpisode } from "./isAiredEpisode.ts";

const TODAY = "2026-11-16";

describe("isAiredEpisode.ts", () => {
	describe("aired", () => {
		it.each(["2026-11-15", TODAY])(
			"SHOULD be aired WHEN it aired on %s",
			(airDate) => {
				expect(isAiredEpisode(airDate, TODAY)).toBe(true);
			},
		);
	});

	describe("not aired", () => {
		it.each(["2026-11-17", null])(
			"SHOULD not be aired WHEN its date is %s",
			(airDate) => {
				expect(isAiredEpisode(airDate, TODAY)).toBe(false);
			},
		);
	});
});
