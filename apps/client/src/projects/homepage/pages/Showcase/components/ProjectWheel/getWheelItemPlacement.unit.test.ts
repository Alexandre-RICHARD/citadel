import { describe, expect, it } from "vitest";

import { computeWheelGeometry } from "./computeWheelGeometry";
import { getWheelItemPlacement } from "./getWheelItemPlacement";
import { WheelOrientationEnum } from "./wheelOrientation.enum";

const geometry = computeWheelGeometry(400, 800, WheelOrientationEnum.Vertical);

describe("getWheelItemPlacement.ts", () => {
	describe("center box", () => {
		it("SHOULD be the biggest and fully opaque WHEN it is at the center", () => {
			const placement = geometry && getWheelItemPlacement(0, geometry);

			expect(placement?.transform).toContain("scale(1.140)");
			expect(placement?.opacity).toBe(1);
		});
	});

	describe("other boxes", () => {
		it("SHOULD fade and sit behind WHEN it is away from the center", () => {
			const center = geometry && getWheelItemPlacement(0, geometry);
			const away = geometry && getWheelItemPlacement(2, geometry);

			expect(away?.opacity).toBeLessThan(center?.opacity ?? 0);
			expect(away?.zIndex).toBeLessThan(center?.zIndex ?? 0);
		});

		it("SHOULD be hidden WHEN it is too far along the arc", () => {
			expect(geometry && getWheelItemPlacement(6, geometry).isVisible).toBe(
				false,
			);
		});
	});
});
