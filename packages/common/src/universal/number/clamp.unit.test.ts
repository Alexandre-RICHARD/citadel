import { describe, expect, it } from "vitest";

import { clamp } from "./clamp.ts";

describe("clamp.ts", () => {
	describe("bounds", () => {
		it("SHOULD return the number WHEN it is between the bounds", () => {
			expect(clamp(5, 0, 10)).toBe(5);
		});

		it("SHOULD return the minimum WHEN the number is below it", () => {
			expect(clamp(-3, 0, 10)).toBe(0);
		});

		it("SHOULD return the maximum WHEN the number is above it", () => {
			expect(clamp(12, 0, 10)).toBe(10);
		});
	});
});
