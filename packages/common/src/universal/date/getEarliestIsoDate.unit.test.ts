import { describe, expect, it } from "vitest";

import { getEarliestIsoDate } from "./getEarliestIsoDate.ts";

describe("getEarliestIsoDate.ts", () => {
	describe("known dates", () => {
		it("SHOULD return the earliest date", () => {
			expect(
				getEarliestIsoDate(["2013-09-17", "2008-04-29", "2013-01-01"]),
			).toBe("2008-04-29");
		});

		it("SHOULD skip the unknown dates", () => {
			expect(getEarliestIsoDate([null, "2013-09-17", null])).toBe("2013-09-17");
		});
	});

	describe("no known date", () => {
		it.each([
			{ reason: "every date is unknown", isoDates: [null, null] },
			{ reason: "there is no date", isoDates: [] },
		])("SHOULD return null WHEN $reason", ({ isoDates }) => {
			expect(getEarliestIsoDate(isoDates)).toBeNull();
		});
	});
});
