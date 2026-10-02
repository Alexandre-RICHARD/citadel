import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionStorage } from "./useSessionStorage.tsx";

const TEST_KEY = "testKey";
const defaultValue = "defaultValue";
const otherValue = "otherValue";

describe("useSessionStorage.tsx", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	describe("initial value", () => {
		it("SHOULD return the default value WHEN nothing is saved in session storage", () => {
			const { result } = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);
			expect(result.current.value).toBe(defaultValue);
		});

		it("SHOULD return the stored value instead of the default value WHEN one exists", () => {
			sessionStorage.setItem(TEST_KEY, JSON.stringify(otherValue));
			const { result } = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);
			expect(result.current.value).toBe(otherValue);
		});
	});

	describe("set and remove", () => {
		it("SHOULD update the state and session storage WHEN a new value is set", () => {
			const { result } = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);

			act(() => {
				result.current.set(otherValue);
			});

			expect(result.current.value).toBe(otherValue);
			expect(sessionStorage.getItem(TEST_KEY)).toBe(JSON.stringify(otherValue));
		});

		it("SHOULD go back to the default value and delete the session storage key WHEN removed", () => {
			sessionStorage.setItem(TEST_KEY, JSON.stringify(otherValue));
			const { result } = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);

			expect(result.current.value).toBe(otherValue);

			act(() => {
				result.current.remove();
			});

			expect(result.current.value).toBe(defaultValue);
			expect(sessionStorage.getItem(TEST_KEY)).toBeNull();
		});
	});

	describe("synchronization", () => {
		it("SHOULD be updated WHEN another hook instance changes the value", () => {
			const first = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);
			const second = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);

			act(() => {
				first.result.current.set(otherValue);
			});

			expect(second.result.current.value).toBe(otherValue);
		});

		it("SHOULD be updated WHEN session storage changes natively, as from another browser tab", () => {
			const { result } = renderHook(() =>
				useSessionStorage<string>(TEST_KEY, defaultValue),
			);

			sessionStorage.setItem(TEST_KEY, JSON.stringify(otherValue));
			act(() => {
				window.dispatchEvent(
					new StorageEvent("storage", {
						key: TEST_KEY,
						newValue: JSON.stringify(otherValue),
						storageArea: sessionStorage,
					}),
				);
			});

			expect(result.current.value).toBe(otherValue);
		});
	});
});
