import { describe, expect, it } from "vitest";

import { computeCpuPercent } from "./computeCpuPercent.ts";

describe("computeCpuPercent.ts", () => {
	describe("usage between two samples", () => {
		it("SHOULD give the share of all cores WHEN two samples exist", () => {
			expect(
				computeCpuPercent(
					{ used: 100, total: 1000 },
					{ used: 350, total: 2000 },
					4,
				),
			).toBe(100);
		});

		it("SHOULD return null WHEN there is no previous sample", () => {
			expect(computeCpuPercent(undefined, { used: 1, total: 1 }, 4)).toBeNull();
		});

		it("SHOULD return null WHEN the counters went backwards", () => {
			expect(
				computeCpuPercent(
					{ used: 500, total: 1000 },
					{ used: 10, total: 2000 },
					4,
				),
			).toBeNull();
		});
	});
});
