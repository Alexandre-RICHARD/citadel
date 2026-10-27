import { describe, expect, it } from "vitest";

import { setCanvasResolution } from "./setCanvasResolution.ts";

describe("setCanvasResolution.ts", () => {
	describe("resolution", () => {
		it("SHOULD round the width and the height", () => {
			const canvas = document.createElement("canvas");

			setCanvasResolution(canvas, 199.6, 100.4);

			expect([canvas.width, canvas.height]).toStrictEqual([200, 100]);
		});

		it("SHOULD keep at least one pixel WHEN the size is zero", () => {
			const canvas = document.createElement("canvas");

			setCanvasResolution(canvas, 0, 0.2);

			expect([canvas.width, canvas.height]).toStrictEqual([1, 1]);
		});
	});
});
