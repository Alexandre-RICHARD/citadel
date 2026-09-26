import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSessionStorage } from "./useSessionStorage";

const TEST_KEY = "testKey";
const defaultValue = "defaultValue";
const otherValue = "otherValue";

describe("useSessionStorage", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	it("SHOULD initialize with default value WHEN nothing in saved in session storage", () => {
		const { result } = renderHook(() =>
			useSessionStorage<string>(TEST_KEY, defaultValue),
		);
		expect(result.current.value).toBe(defaultValue);
	});

	it("SHOULD return already stored value WHEN it exists instead of defaultValue", () => {
		sessionStorage.setItem(TEST_KEY, JSON.stringify(otherValue));
		const { result } = renderHook(() =>
			useSessionStorage<string>(TEST_KEY, defaultValue),
		);
		expect(result.current.value).toBe(otherValue);
	});

	it("SHOULD update state and session storage WHEN set newValue", () => {
		const { result } = renderHook(() =>
			useSessionStorage<string>(TEST_KEY, defaultValue),
		);

		act(() => {
			result.current.set(otherValue);
		});

		expect(result.current.value).toBe(otherValue);
		expect(sessionStorage.getItem(TEST_KEY)).toBe(JSON.stringify(otherValue));
	});

	it("SHOULD be set at defaultValue AND sessionStorage key to be deleted WHEN remove", () => {
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

	it("SHOULD be updated WHEN changes has been made in another hook instance", () => {
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

	it("SHOULD be updated WHEN session storage changes natively (like if change come from another browser tab)", () => {
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
