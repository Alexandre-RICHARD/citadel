import { describe, expect, it } from "vitest";

import { getHighestKnownValue } from "./getHighestKnownValue.ts";

describe("getHighestKnownValue.ts", () => {
	describe("known values", () => {
		it("SHOULD return the highest value", () => {
			expect(getHighestKnownValue([12, 18, 3])).toBe(18);
		});

		it("SHOULD skip the unknown values", () => {
			expect(getHighestKnownValue([null, -4, null])).toBe(-4);
		});
	});

	describe("no known value", () => {
		it.each([
			{ reason: "every value is unknown", values: [null] },
			{ reason: "there is no value", values: [] },
		])("SHOULD return null WHEN $reason", ({ values }) => {
			expect(getHighestKnownValue(values)).toBeNull();
		});
	});
});
