import { describe, expect, it } from "vitest";

import { mixHexColors } from "./mixHexColors.ts";

describe("mixHexColors.ts", () => {
	describe("ratio", () => {
		it("SHOULD return the first color WHEN the ratio is 0", () => {
			expect(mixHexColors("#000000", "#ffffff", 0)).toBe("rgb(0,0,0)");
		});

		it("SHOULD return the second color WHEN the ratio is 1", () => {
			expect(mixHexColors("#000000", "#ffffff", 1)).toBe("rgb(255,255,255)");
		});

		it("SHOULD blend each channel WHEN the ratio is in between", () => {
			expect(mixHexColors("#000000", "#ff8000", 0.5)).toBe("rgb(128,64,0)");
		});
	});
});
