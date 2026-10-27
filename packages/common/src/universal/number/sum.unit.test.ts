import { describe, expect, it } from "vitest";

import { sum } from "./sum.ts";

describe("sum.ts", () => {
	describe("values", () => {
		it("SHOULD add up every value", () => {
			expect(sum([1, 2.5, -4])).toBe(-0.5);
		});

		it("SHOULD return 0 WHEN there is no value", () => {
			expect(sum([])).toBe(0);
		});
	});
});
