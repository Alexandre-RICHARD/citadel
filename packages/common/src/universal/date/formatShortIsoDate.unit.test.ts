import { describe, expect, it } from "vitest";

import { formatShortIsoDate } from "./formatShortIsoDate.ts";

describe("formatShortIsoDate.ts", () => {
	describe("ISO date", () => {
		it("SHOULD write the date day first, with slashes", () => {
			expect(formatShortIsoDate("2013-09-17")).toBe("17/09/2013");
		});
	});
});
