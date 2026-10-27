import { describe, expect, it, vi } from "vitest";

import { traceHexagon } from "./traceHexagon.ts";

function createRecordingContext() {
	const context = {
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		closePath: vi.fn(),
		beginPath: vi.fn(),
	};
	return {
		context,
		canvasContext: context as unknown as CanvasRenderingContext2D,
	};
}

describe("traceHexagon.ts", () => {
	describe("path", () => {
		it("SHOULD start on the right corner and close after six corners", () => {
			const { context, canvasContext } = createRecordingContext();

			traceHexagon(canvasContext, { x: 10, y: 20 }, 5);

			expect(context.moveTo).toHaveBeenCalledExactlyOnceWith(15, 20);
			expect(context.lineTo).toHaveBeenCalledTimes(5);
			expect(context.closePath).toHaveBeenCalledOnce();
		});

		it("SHOULD place the corners on the circle of the radius", () => {
			const { context, canvasContext } = createRecordingContext();

			traceHexagon(canvasContext, { x: 0, y: 0 }, 2);

			for (const [x, y] of context.lineTo.mock.calls as [number, number][])
				expect(Math.hypot(x, y)).toBeCloseTo(2);
		});

		it("SHOULD rotate the first corner WHEN a rotation is given", () => {
			const { context, canvasContext } = createRecordingContext();

			traceHexagon(canvasContext, { x: 0, y: 0 }, 4, Math.PI / 2);

			const [[x, y]] = context.moveTo.mock.calls as [number, number][];
			expect(x).toBeCloseTo(0);
			expect(y).toBeCloseTo(4);
		});

		it("SHOULD leave the path open to the caller", () => {
			const { context, canvasContext } = createRecordingContext();

			traceHexagon(canvasContext, { x: 0, y: 0 }, 1);

			expect(context.beginPath).not.toHaveBeenCalled();
		});
	});
});
