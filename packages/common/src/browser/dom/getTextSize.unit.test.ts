import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { getTextSize as GetTextSize } from "./getTextSize.ts";

// jsdom n'a pas de canvas : on simule un contexte 2D où chaque caractère mesure 10 px
function mockCanvasContext() {
	const context = {
		font: "",
		measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
	};
	const getContext = vi
		.spyOn(HTMLCanvasElement.prototype, "getContext")
		.mockReturnValue(context as unknown as CanvasRenderingContext2D);
	return { context, getContext };
}

describe("getTextSize.ts", () => {
	let getTextSize: typeof GetTextSize;

	beforeEach(async () => {
		// Le contexte est gardé en cache dans le module : chaque test repart d'un module neuf
		vi.resetModules();
		({ getTextSize } = await import("./getTextSize.ts"));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("measure", () => {
		it("SHOULD return the width measured by the canvas", () => {
			const { context } = mockCanvasContext();

			expect(getTextSize("Celeste", 16, "Arial")).toBe(70);
			expect(context.measureText).toHaveBeenCalledWith("Celeste");
		});

		it("SHOULD apply the weight, the size and the font family before measuring", () => {
			const { context } = mockCanvasContext();

			getTextSize("Fez", 24, "Roboto", "bold");

			expect(context.font).toBe("bold 24px Roboto");
		});

		it("SHOULD use a normal weight WHEN none is given", () => {
			const { context } = mockCanvasContext();

			getTextSize("Fez", 12, "Arial");

			expect(context.font).toBe("normal 12px Arial");
		});

		it("SHOULD create the canvas context only once WHEN measuring several texts", () => {
			const { getContext } = mockCanvasContext();

			getTextSize("Hades", 12, "Arial");
			getTextSize("Hades II", 12, "Arial");

			expect(getContext).toHaveBeenCalledTimes(1);
		});
	});

	describe("unavailable canvas", () => {
		it("SHOULD throw an explicit error WHEN the browser gives no 2D context", () => {
			vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

			expect(() => getTextSize("Celeste", 16, "Arial")).toThrow(
				"getTextSize → canvas 2D context is not available",
			);
		});
	});
});
