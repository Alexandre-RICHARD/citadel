import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./createSeededRandom.ts";

function draw(random: () => number, count: number): number[] {
	return Array.from({ length: count }, () => random());
}

describe("createSeededRandom.ts", () => {
	describe("reproducibility", () => {
		it("SHOULD give the same sequence WHEN the seed is the same", () => {
			expect(draw(createSeededRandom(11), 5)).toStrictEqual(
				draw(createSeededRandom(11), 5),
			);
		});

		it("SHOULD give another sequence WHEN the seed differs", () => {
			expect(draw(createSeededRandom(11), 5)).not.toStrictEqual(
				draw(createSeededRandom(12), 5),
			);
		});
	});

	describe("range", () => {
		it("SHOULD only give numbers between 0 and 1", () => {
			for (const value of draw(createSeededRandom(7), 1000)) {
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(1);
			}
		});
	});
});
