import { describe, expect, it } from "vitest";

import { formatDuration } from "./formatDuration";

describe("formatDuration.ts", () => {
	describe("largest units first", () => {
		it("SHOULD show seconds WHEN under a minute", () => {
			expect(formatDuration(45)).toBe("45 s");
		});

		it("SHOULD show hours and padded minutes WHEN under a day", () => {
			expect(formatDuration(3 * 3600 + 5 * 60)).toBe("3 h 05");
		});

		it("SHOULD show days and hours WHEN over a day", () => {
			expect(formatDuration(4 * 86400 + 2 * 3600 + 59)).toBe("4 j 2 h");
		});
	});
});
