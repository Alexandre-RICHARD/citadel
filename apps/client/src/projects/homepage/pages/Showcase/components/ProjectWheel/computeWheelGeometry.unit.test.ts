import { describe, expect, it } from "vitest";

import { computeWheelGeometry } from "./computeWheelGeometry";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

describe("computeWheelGeometry.ts", () => {
	describe("size", () => {
		it("SHOULD return null WHEN the wheel has no size yet", () => {
			expect(computeWheelGeometry(0, 800, WheelOrientationEnum.Vertical)).toBe(
				null,
			);
		});
	});

	describe("vertical", () => {
		it("SHOULD center the circle left of the wheel WHEN the arc bulges right", () => {
			const geometry = computeWheelGeometry(
				400,
				800,
				WheelOrientationEnum.Vertical,
			);

			expect(geometry?.centerX).toBeLessThan(0);
			expect(geometry?.centerY).toBe(400);
		});
	});

	describe("horizontal", () => {
		it("SHOULD center the circle above the wheel WHEN the arc bulges down", () => {
			const geometry = computeWheelGeometry(
				390,
				172,
				WheelOrientationEnum.Horizontal,
			);

			expect(geometry?.centerX).toBe(195);
			expect(geometry?.centerY).toBeLessThan(0);
		});
	});
});
