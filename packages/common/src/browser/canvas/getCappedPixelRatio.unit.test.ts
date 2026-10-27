import { afterEach, describe, expect, it, vi } from "vitest";

import { getCappedPixelRatio } from "./getCappedPixelRatio.ts";

describe("getCappedPixelRatio.ts", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("screen density", () => {
		it("SHOULD return the screen density WHEN it is below the cap", () => {
			vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(1.5);

			expect(getCappedPixelRatio(2)).toBe(1.5);
		});

		it("SHOULD return the cap WHEN the screen is denser", () => {
			vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(3);

			expect(getCappedPixelRatio(2)).toBe(2);
		});

		it("SHOULD fall back to 1 WHEN the density is unknown", () => {
			vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(0);

			expect(getCappedPixelRatio(2)).toBe(1);
		});
	});
});
