import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { readLocalStorage } from "./readLocalStorage.ts";

const KEY = "citadel:test";

describe("readLocalStorage.ts", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("stored value", () => {
		it("SHOULD parse the stored JSON", () => {
			localStorage.setItem(KEY, '{"columns":["name"]}');

			expect(readLocalStorage(KEY)).toStrictEqual({ columns: ["name"] });
		});

		it("SHOULD keep a stored null", () => {
			localStorage.setItem(KEY, "null");

			expect(readLocalStorage(KEY)).toBeNull();
		});
	});

	describe("unreadable value", () => {
		it("SHOULD return undefined WHEN nothing is stored", () => {
			expect(readLocalStorage(KEY)).toBeUndefined();
		});

		it("SHOULD return undefined WHEN the JSON is invalid", () => {
			localStorage.setItem(KEY, "{oops");

			expect(readLocalStorage(KEY)).toBeUndefined();
		});

		it("SHOULD return undefined WHEN the storage cannot be read", () => {
			vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
				throw new Error("SecurityError");
			});

			expect(readLocalStorage(KEY)).toBeUndefined();
		});
	});
});
