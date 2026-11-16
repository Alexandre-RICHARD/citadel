import { describe, expect, it } from "vitest";

import { isOngoingTmdbShow } from "./isOngoingTmdbShow.ts";

describe("isOngoingTmdbShow.ts", () => {
	describe("ongoing", () => {
		it.each(["Returning Series", "In Production", "Planned", "Pilot"])(
			"SHOULD be ongoing WHEN the status is %s",
			(status) => {
				expect(isOngoingTmdbShow(status, false)).toBe(true);
			},
		);

		it("SHOULD be ongoing WHEN TMDB says it is in production, whatever the status", () => {
			expect(isOngoingTmdbShow("Ended", true)).toBe(true);
		});
	});

	describe("finished", () => {
		it.each(["Ended", "Canceled", null])(
			"SHOULD not be ongoing WHEN the status is %s and it is not in production",
			(status) => {
				expect(isOngoingTmdbShow(status, null)).toBe(false);
			},
		);
	});
});
