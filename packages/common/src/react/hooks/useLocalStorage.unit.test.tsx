import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage.tsx";

const KEY = "autoRefetch";

describe("useLocalStorage.tsx", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("initial value", () => {
		it("SHOULD return the default value and save it WHEN nothing is stored", () => {
			const { result } = renderHook(() =>
				useLocalStorage(KEY, { enabled: true }),
			);

			expect(result.current.value).toStrictEqual({ enabled: true });
			expect(localStorage.getItem(KEY)).toBe('{"enabled":true}');
		});

		it("SHOULD return the stored value WHEN one exists", () => {
			localStorage.setItem(KEY, '{"enabled":false}');

			const { result } = renderHook(() =>
				useLocalStorage(KEY, { enabled: true }),
			);

			expect(result.current.value).toStrictEqual({ enabled: false });
		});

		it("SHOULD keep a stored falsy value WHEN it is not null", () => {
			localStorage.setItem(KEY, "0");

			const { result } = renderHook(() => useLocalStorage(KEY, 30));

			expect(result.current.value).toBe(0);
		});

		it("SHOULD return the default value WHEN the stored value is null", () => {
			localStorage.setItem(KEY, "null");

			const { result } = renderHook(() => useLocalStorage(KEY, 30));

			expect(result.current.value).toBe(30);
		});

		it("SHOULD return the default value instead of crashing WHEN the stored value is not valid JSON", () => {
			localStorage.setItem(KEY, "{not json");

			const { result } = renderHook(() => useLocalStorage(KEY, 30));

			expect(result.current.value).toBe(30);
			expect(localStorage.getItem(KEY)).toBe("30");
		});

		it("SHOULD read the storage only once WHEN the component renders again", () => {
			const getItem = vi.spyOn(Storage.prototype, "getItem");
			const { rerender } = renderHook(() => useLocalStorage(KEY, 30));

			rerender();
			rerender();

			expect(getItem).toHaveBeenCalledTimes(1);
		});
	});

	describe("update", () => {
		it("SHOULD update the state and the storage WHEN a new value is set", () => {
			const { result } = renderHook(() => useLocalStorage(KEY, 30));

			act(() => {
				result.current.setValue(60);
			});

			expect(result.current.value).toBe(60);
			expect(localStorage.getItem(KEY)).toBe("60");
		});
	});
});
