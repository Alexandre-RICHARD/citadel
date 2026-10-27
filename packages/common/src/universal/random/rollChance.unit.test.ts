import { afterEach, describe, expect, it, vi } from "vitest";

import { rollChance } from "./rollChance.ts";

describe("rollChance.ts", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("draw", () => {
		it("SHOULD return true WHEN the draw is below the probability", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.29);

			expect(rollChance(0.3)).toBe(true);
		});

		it("SHOULD return false WHEN the draw reaches the probability", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.3);

			expect(rollChance(0.3)).toBe(false);
		});
	});

	describe("extreme probabilities", () => {
		it("SHOULD never be true WHEN the probability is 0", () => {
			vi.spyOn(Math, "random").mockReturnValue(0);

			expect(rollChance(0)).toBe(false);
		});

		it("SHOULD always be true WHEN the probability is 1", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.999);

			expect(rollChance(1)).toBe(true);
		});
	});
});
