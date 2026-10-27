import { describe, expect, it } from "vitest";

import { formatDlcProgress } from "./formatDlcProgress";

describe("formatDlcProgress.ts", () => {
	describe("game with DLCs", () => {
		it("SHOULD write the done DLCs over the total", () => {
			expect(formatDlcProgress(2, 5)).toBe("2 / 5");
		});
	});

	describe("game without DLC", () => {
		it("SHOULD stay empty WHEN the game has no DLC", () => {
			expect(formatDlcProgress(0, 0)).toBe("");
		});
	});
});
