import { beforeEach, describe, expect, it, vi } from "vitest";

import { PAGE_TRANSITIONS_STORAGE_KEY } from "./pageTransitionsStorageKey";
import { pageTransitionsStore } from "./pageTransitionsStore";

describe("pageTransitionsStore.ts", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe("isDisabled", () => {
		it("SHOULD be false WHEN nothing is stored", () => {
			expect(pageTransitionsStore.isDisabled()).toBe(false);
		});

		it("SHOULD be true WHEN true is stored", () => {
			localStorage.setItem(PAGE_TRANSITIONS_STORAGE_KEY, "true");

			expect(pageTransitionsStore.isDisabled()).toBe(true);
		});

		it("SHOULD be false WHEN the stored value is not a boolean", () => {
			localStorage.setItem(PAGE_TRANSITIONS_STORAGE_KEY, '"yes"');

			expect(pageTransitionsStore.isDisabled()).toBe(false);
		});
	});

	describe("setDisabled", () => {
		it("SHOULD keep the choice in the local storage", () => {
			pageTransitionsStore.setDisabled(true);

			expect(pageTransitionsStore.isDisabled()).toBe(true);
		});

		it("SHOULD notify the subscribers", () => {
			const listener = vi.fn();
			const unsubscribe = pageTransitionsStore.subscribe(listener);

			pageTransitionsStore.setDisabled(true);

			expect(listener).toHaveBeenCalledTimes(1);
			unsubscribe();
		});

		it("SHOULD NOT notify an unsubscribed listener", () => {
			const listener = vi.fn();
			pageTransitionsStore.subscribe(listener)();

			pageTransitionsStore.setDisabled(true);

			expect(listener).not.toHaveBeenCalled();
		});
	});
});
