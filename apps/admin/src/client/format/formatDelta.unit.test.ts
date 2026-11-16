import { describe, expect, it } from "vitest";

import { formatDelta } from "./formatDelta";

describe("formatDelta.ts", () => {
	describe("change", () => {
		it("SHOULD sign the difference", () => {
			expect(formatDelta(2941, 2929)).toBe("+12");
			expect(formatDelta(27, 29)).toBe("−2");
		});
	});

	describe("no change", () => {
		it("SHOULD say nothing WHEN equal or without a previous run", () => {
			expect(formatDelta(9, 9)).toBeNull();
			expect(formatDelta(9, null)).toBeNull();
		});
	});
});
