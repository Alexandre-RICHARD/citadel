import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "./useDebouncedValue.tsx";

describe("useDebouncedValue.tsx", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("debounce", () => {
		it("SHOULD return the initial value right away", () => {
			const { result } = renderHook(() => useDebouncedValue("ze", 300));

			expect(result.current).toBe("ze");
		});

		it("SHOULD keep the previous value WHEN the delay has not elapsed", () => {
			const { result, rerender } = renderHook(
				({ value }) => useDebouncedValue(value, 300),
				{ initialProps: { value: "ze" } },
			);

			rerender({ value: "zel" });
			act(() => {
				vi.advanceTimersByTime(299);
			});

			expect(result.current).toBe("ze");
		});

		it("SHOULD return the last value WHEN the delay has elapsed since the last change", () => {
			const { result, rerender } = renderHook(
				({ value }) => useDebouncedValue(value, 300),
				{ initialProps: { value: "ze" } },
			);

			rerender({ value: "zel" });
			act(() => {
				vi.advanceTimersByTime(200);
			});
			rerender({ value: "zelda" });
			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(result.current).toBe("zelda");
		});
	});
});
