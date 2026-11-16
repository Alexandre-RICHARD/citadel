import { describe, expect, it } from "vitest";

import { computeGbPerHour } from "./computeGbPerHour.ts";

describe("computeGbPerHour.ts", () => {
	describe("weight per hour", () => {
		it("SHOULD divide the size by the duration", () => {
			expect(computeGbPerHour(6_000_000_000, 90)).toBe(4);
		});
	});

	describe("missing values", () => {
		it.each([
			{ reason: "the size is unknown", sizeBytes: null, minutes: 90 },
			{ reason: "the duration is unknown", sizeBytes: 1, minutes: null },
			{ reason: "the duration is zero", sizeBytes: 1, minutes: 0 },
		])("SHOULD give nothing WHEN $reason", ({ sizeBytes, minutes }) => {
			expect(computeGbPerHour(sizeBytes, minutes)).toBeNull();
		});
	});
});
