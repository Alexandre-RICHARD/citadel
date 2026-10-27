import { describe, expect, it } from "vitest";

import { countDoneDlcs } from "./countDoneDlcs.ts";

describe("countDoneDlcs.ts", () => {
	describe("done DLCs", () => {
		it("SHOULD count each done DLC of the game once", () => {
			expect(countDoneDlcs([1, 2, 2, 1], [1, 2, 3])).toBe(2);
		});

		it("SHOULD skip a DLC no longer tied to the game", () => {
			expect(countDoneDlcs([1, 9], [1, 2])).toBe(1);
		});

		it("SHOULD return 0 WHEN no DLC is done", () => {
			expect(countDoneDlcs([], [1, 2])).toBe(0);
		});
	});
});
