import { describe, expect, it } from "vitest";

import { average } from "./average.ts";

describe("average.ts", () => {
	describe("values", () => {
		it("SHOULD return the arithmetic mean", () => {
			expect(average([2, 4, 9])).toBe(5);
		});
	});

	describe("empty input", () => {
		it("SHOULD return null WHEN there is no value", () => {
			expect(average([])).toBeNull();
		});
	});
});
