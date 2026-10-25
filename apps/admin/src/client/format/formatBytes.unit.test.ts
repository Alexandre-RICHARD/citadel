import { describe, expect, it } from "vitest";

import { formatBytes } from "./formatBytes";

// Intl sépare le nombre de son unité par une espace normale ; les milliers, jamais atteints ici
describe("formatBytes.ts", () => {
	describe("units", () => {
		it("SHOULD keep bytes WHEN below one kilobyte", () => {
			expect(formatBytes(512)).toBe("512 o");
		});

		it("SHOULD switch to the largest fitting unit with one decimal WHEN bigger", () => {
			expect(formatBytes(1536)).toBe("1,5 Ko");
			expect(formatBytes(5 * 1024 ** 3)).toBe("5 Go");
		});
	});
});
