import { describe, expect, it } from "vitest";

import { mapNullableDateToStringOrNull } from "./mapNullableDateToStringOrNull.ts";

describe("mapNullableDateToStringOrNull.ts", () => {
	describe("existing date", () => {
		it("SHOULD return the ISO string in UTC", () => {
			expect(
				mapNullableDateToStringOrNull(new Date("2010-10-20T18:00:00.000Z")),
			).toBe("2010-10-20T18:00:00.000Z");
		});
	});

	describe("missing date", () => {
		it("SHOULD return null WHEN the date is null", () => {
			expect(mapNullableDateToStringOrNull(null)).toBeNull();
		});
	});
});
