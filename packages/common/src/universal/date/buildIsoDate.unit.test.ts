import { describe, expect, it } from "vitest";

import { buildIsoDate } from "./buildIsoDate.ts";

describe("buildIsoDate.ts", () => {
	describe("parts", () => {
		it("SHOULD pad the month and the day", () => {
			expect(buildIsoDate(2013, 9, 7)).toBe("2013-09-07");
		});

		it("SHOULD pad the year to 4 digits WHEN it is before 1000", () => {
			expect(buildIsoDate(987, 12, 31)).toBe("0987-12-31");
		});
	});
});
