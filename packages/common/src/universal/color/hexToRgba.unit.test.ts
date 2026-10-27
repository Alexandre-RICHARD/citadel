import { describe, expect, it } from "vitest";

import { hexToRgba } from "./hexToRgba.ts";

describe("hexToRgba.ts", () => {
	describe("opacity", () => {
		it("SHOULD add the opacity to the color channels", () => {
			expect(hexToRgba("#e30613", 0.5)).toBe("rgba(227,6,19,0.5)");
		});
	});
});
