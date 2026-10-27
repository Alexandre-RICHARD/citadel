import { describe, expect, it } from "vitest";

import { rubberBand } from "./rubberBand";

describe("rubberBand.ts", () => {
	describe("inside the stops", () => {
		it("SHOULD keep the position WHEN it is between the first and last box", () => {
			expect(rubberBand(2.4, 5)).toBe(2.4);
		});
	});

	describe("beyond the stops", () => {
		it("SHOULD resist WHEN the wheel is pulled before the first box", () => {
			const position = rubberBand(-1, 5);

			expect(position).toBeLessThan(0);
			expect(position).toBeGreaterThan(-1);
		});

		it("SHOULD never go further than half a box WHEN the wheel is pulled hard", () => {
			expect(rubberBand(50, 5)).toBeLessThan(5.5);
			expect(rubberBand(-50, 5)).toBeGreaterThan(-0.5);
		});
	});
});
