import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage.tsx";

const KEY = "citadel:test";

function sanitizeDelay(stored: unknown): number {
	return typeof stored === "number" ? stored : 30;
}

describe("useLocalStorage.tsx", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("initial value", () => {
		it("SHOULD give undefined to sanitize and save its result WHEN nothing is stored", () => {
			const sanitize = vi.fn(sanitizeDelay);

			const { result } = renderHook(() => useLocalStorage(KEY, sanitize));

			expect(sanitize).toHaveBeenCalledWith(undefined);
			expect(result.current[0]).toBe(30);
			expect(localStorage.getItem(KEY)).toBe("30");
		});

		it("SHOULD return the stored value WHEN sanitize accepts it", () => {
			localStorage.setItem(KEY, "0");

			const { result } = renderHook(() => useLocalStorage(KEY, sanitizeDelay));

			expect(result.current[0]).toBe(0);
		});

		it("SHOULD return the sanitized value WHEN the stored value is invalid", () => {
			localStorage.setItem(KEY, '"soon"');

			const { result } = renderHook(() => useLocalStorage(KEY, sanitizeDelay));

			expect(result.current[0]).toBe(30);
			expect(localStorage.getItem(KEY)).toBe("30");
		});

		it("SHOULD give undefined to sanitize WHEN the stored value is not valid JSON", () => {
			localStorage.setItem(KEY, "{not json");
			const sanitize = vi.fn(sanitizeDelay);

			renderHook(() => useLocalStorage(KEY, sanitize));

			expect(sanitize).toHaveBeenCalledWith(undefined);
		});

		it("SHOULD read the storage only once WHEN the component renders again", () => {
			const getItem = vi.spyOn(Storage.prototype, "getItem");
			const { rerender } = renderHook(() =>
				useLocalStorage(KEY, sanitizeDelay),
			);

			rerender();
			rerender();

			expect(getItem).toHaveBeenCalledTimes(1);
		});
	});

	describe("update", () => {
		it("SHOULD update the state and the storage WHEN a new value is set", () => {
			const { result } = renderHook(() => useLocalStorage(KEY, sanitizeDelay));

			act(() => {
				result.current[1](60);
			});

			expect(result.current[0]).toBe(60);
			expect(localStorage.getItem(KEY)).toBe("60");
		});

		it("SHOULD keep the value in memory WHEN the storage refuses it", () => {
			vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
				throw new Error("QuotaExceededError");
			});
			const { result } = renderHook(() => useLocalStorage(KEY, sanitizeDelay));

			act(() => {
				result.current[1](60);
			});

			expect(result.current[0]).toBe(60);
		});
	});
});
