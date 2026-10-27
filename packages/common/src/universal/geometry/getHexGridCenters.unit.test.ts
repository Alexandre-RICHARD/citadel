import { describe, expect, it } from "vitest";

import { getHexGridCenters } from "./getHexGridCenters.ts";

const RADIUS = 10;
const COLUMN_STEP = RADIUS * 1.5;
const ROW_STEP = RADIUS * Math.sqrt(3);

describe("getHexGridCenters.ts", () => {
	describe("layout", () => {
		it("SHOULD start one cell before the top left corner", () => {
			const [first] = getHexGridCenters(100, 100, RADIUS);

			expect(first?.x).toBe(-COLUMN_STEP);
			expect(first?.y).toBeCloseTo(-ROW_STEP + ROW_STEP / 2);
		});

		it("SHOULD shift every other column down by half a row", () => {
			const centers = getHexGridCenters(30, 30, RADIUS);
			const oddColumnTop = centers.find(({ x }) => x === -COLUMN_STEP);
			const evenColumnTop = centers.find(({ x }) => x === 0);

			expect(oddColumnTop?.y).toBeCloseTo(-ROW_STEP / 2);
			expect(evenColumnTop?.y).toBeCloseTo(-ROW_STEP);
		});
	});

	describe("coverage", () => {
		it("SHOULD reach the bottom right corner", () => {
			const centers = getHexGridCenters(200, 120, RADIUS);

			expect(Math.max(...centers.map(({ x }) => x))).toBeGreaterThanOrEqual(
				200 - RADIUS,
			);
			expect(Math.max(...centers.map(({ y }) => y))).toBeGreaterThanOrEqual(
				120 - RADIUS,
			);
		});
	});
});
