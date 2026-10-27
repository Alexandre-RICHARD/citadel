import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { writeLocalStorage } from "./writeLocalStorage.ts";

const KEY = "citadel:test";

describe("writeLocalStorage.ts", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("available storage", () => {
		it("SHOULD store the value as JSON", () => {
			writeLocalStorage(KEY, { isCollapsed: true });

			expect(localStorage.getItem(KEY)).toBe('{"isCollapsed":true}');
		});
	});

	describe("unavailable storage", () => {
		it("SHOULD not throw WHEN the storage refuses the value", () => {
			vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
				throw new Error("QuotaExceededError");
			});

			expect(() => writeLocalStorage(KEY, "value")).not.toThrow();
		});
	});
});
