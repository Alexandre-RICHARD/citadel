import { afterEach, describe, expect, it, vi } from "vitest";

import { waitForNextPaint } from "./waitForNextPaint.ts";

describe("waitForNextPaint.ts", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("frames", () => {
		it("SHOULD resolve only after the second animation frame", async () => {
			const frames: FrameRequestCallback[] = [];
			vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
				frames.push(callback),
			);
			const onResolve = vi.fn();
			const waiting = waitForNextPaint().then(onResolve);

			frames.shift()?.(0);
			await Promise.resolve();
			expect(onResolve).not.toHaveBeenCalled();

			frames.shift()?.(16);
			await waiting;
			expect(onResolve).toHaveBeenCalledOnce();
		});
	});
});
