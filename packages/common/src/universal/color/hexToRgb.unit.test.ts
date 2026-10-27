import { describe, expect, it } from "vitest";

import { hexToRgb } from "./hexToRgb.ts";

describe("hexToRgb.ts", () => {
	describe("formats", () => {
		it("SHOULD read the three channels WHEN the color has six digits", () => {
			expect(hexToRgb("#e30613")).toEqual([227, 6, 19]);
		});

		it("SHOULD double each digit WHEN the color has three digits", () => {
			expect(hexToRgb("#fa0")).toEqual([255, 170, 0]);
		});

		it("SHOULD ignore the opacity WHEN the color has eight digits", () => {
			expect(hexToRgb("#0f172a1a")).toEqual([15, 23, 42]);
		});
	});
});
