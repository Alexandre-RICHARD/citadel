import { describe, expect, it } from "vitest";

import { fromIgdbTimestampToIsoDate } from "./fromIgdbTimestampToIsoDate.ts";

describe("fromIgdbTimestampToIsoDate.ts", () => {
	describe("timestamp", () => {
		it("SHOULD give the UTC day of the timestamp", () => {
			expect(fromIgdbTimestampToIsoDate(1316649600)).toBe("2011-09-22");
		});

		it("SHOULD return null WHEN IGDB has no date", () => {
			expect(fromIgdbTimestampToIsoDate(undefined)).toBeNull();
		});
	});
});
