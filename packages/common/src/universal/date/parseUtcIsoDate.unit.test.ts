import { describe, expect, it } from "vitest";

import { parseUtcIsoDate } from "./parseUtcIsoDate.ts";

describe("parseUtcIsoDate.ts", () => {
	describe("ISO date", () => {
		it("SHOULD return midnight UTC of the day", () => {
			expect(parseUtcIsoDate("2013-09-17").toISOString()).toBe(
				"2013-09-17T00:00:00.000Z",
			);
		});
	});
});
