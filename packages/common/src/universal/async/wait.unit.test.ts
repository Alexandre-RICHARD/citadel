import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { wait } from "./wait.ts";

describe("wait.ts", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("delay", () => {
		it("SHOULD resolve only once the delay has elapsed", async () => {
			const onResolve = vi.fn();
			const waiting = wait(100).then(onResolve);

			await vi.advanceTimersByTimeAsync(99);
			expect(onResolve).not.toHaveBeenCalled();

			await vi.advanceTimersByTimeAsync(1);
			await waiting;
			expect(onResolve).toHaveBeenCalledOnce();
		});
	});
});
