import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNow } from "./useNow.tsx";

const START = new Date("2026-10-27T10:00:00Z").getTime();

describe("useNow.tsx", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(START);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("refresh", () => {
		it("SHOULD return the current time", () => {
			const { result } = renderHook(() => useNow(1000));

			expect(result.current).toBe(START);
		});

		it("SHOULD refresh the time at each interval", () => {
			const { result } = renderHook(() => useNow(1000));

			act(() => {
				vi.advanceTimersByTime(3000);
			});

			expect(result.current).toBe(START + 3000);
		});
	});

	describe("frozen clock", () => {
		it("SHOULD keep the same time WHEN the interval is null", () => {
			const { result } = renderHook(() => useNow(null));

			act(() => {
				vi.advanceTimersByTime(3000);
			});

			expect(result.current).toBe(START);
		});

		it("SHOULD catch up at once WHEN the clock starts again", () => {
			const { result, rerender } = renderHook(
				({ intervalMs }) => useNow(intervalMs),
				{ initialProps: { intervalMs: null as number | null } },
			);
			act(() => {
				vi.advanceTimersByTime(5000);
			});

			rerender({ intervalMs: 60_000 });
			act(() => {
				vi.advanceTimersByTime(0);
			});

			expect(result.current).toBe(START + 5000);
		});
	});
});
