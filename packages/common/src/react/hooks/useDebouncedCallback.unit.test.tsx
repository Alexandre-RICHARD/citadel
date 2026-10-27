import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "./useDebouncedCallback.tsx";

describe("useDebouncedCallback.tsx", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("debounce", () => {
		it("SHOULD call the function once with the last arguments WHEN calls follow each other", () => {
			const callback = vi.fn();
			const { result } = renderHook(() => useDebouncedCallback(callback, 300));

			result.current("ze");
			vi.advanceTimersByTime(100);
			result.current("zelda");
			vi.advanceTimersByTime(299);
			expect(callback).not.toHaveBeenCalled();

			vi.advanceTimersByTime(1);
			expect(callback).toHaveBeenCalledExactlyOnceWith("zelda");
		});

		it("SHOULD call the latest function WHEN it changed during the delay", () => {
			const first = vi.fn();
			const second = vi.fn();
			const { result, rerender } = renderHook(
				({ callback }) => useDebouncedCallback(callback, 300),
				{ initialProps: { callback: first } },
			);

			result.current();
			rerender({ callback: second });
			vi.advanceTimersByTime(300);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledOnce();
		});
	});

	describe("unmount", () => {
		it("SHOULD drop the pending call WHEN the component unmounts", () => {
			const callback = vi.fn();
			const { result, unmount } = renderHook(() =>
				useDebouncedCallback(callback, 300),
			);

			result.current();
			unmount();
			vi.advanceTimersByTime(300);

			expect(callback).not.toHaveBeenCalled();
		});
	});
});
