import { describe, expect, it, vi } from "vitest";

import { navigateResults } from "./navigateResults.ts";

function press(key: string, activeIndex: number, count: number) {
	const event = { key, preventDefault: vi.fn() };
	const setActiveIndex = vi.fn();
	const selectActive = vi.fn();
	const isHandled = navigateResults(
		event,
		activeIndex,
		count,
		setActiveIndex,
		selectActive,
	);
	return { event, setActiveIndex, selectActive, isHandled };
}

describe("navigateResults.ts", () => {
	describe("arrows", () => {
		it("SHOULD move to the next result WHEN the key is ArrowDown", () => {
			const { setActiveIndex, event, isHandled } = press("ArrowDown", 0, 3);

			expect(setActiveIndex).toHaveBeenCalledWith(1);
			expect(event.preventDefault).toHaveBeenCalledOnce();
			expect(isHandled).toBe(true);
		});

		it("SHOULD stay on the last result WHEN ArrowDown is pressed on it", () => {
			expect(press("ArrowDown", 2, 3).setActiveIndex).toHaveBeenCalledWith(2);
		});

		it("SHOULD move to the previous result WHEN the key is ArrowUp", () => {
			expect(press("ArrowUp", 2, 3).setActiveIndex).toHaveBeenCalledWith(1);
		});

		it("SHOULD stay on the first result WHEN ArrowUp is pressed on it", () => {
			expect(press("ArrowUp", 0, 3).setActiveIndex).toHaveBeenCalledWith(0);
		});

		it("SHOULD go to the first result WHEN ArrowDown is pressed with no active result", () => {
			expect(press("ArrowDown", -1, 3).setActiveIndex).toHaveBeenCalledWith(0);
		});
	});

	describe("selection", () => {
		it("SHOULD select the active result WHEN the key is Enter", () => {
			const { selectActive, isHandled } = press("Enter", 1, 3);

			expect(selectActive).toHaveBeenCalledOnce();
			expect(isHandled).toBe(true);
		});

		it("SHOULD let Enter through WHEN no result is active", () => {
			const { selectActive, event, isHandled } = press("Enter", -1, 3);

			expect(selectActive).not.toHaveBeenCalled();
			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(isHandled).toBe(false);
		});
	});

	describe("ignored keys", () => {
		it("SHOULD let the key through WHEN there is no result", () => {
			const { setActiveIndex, isHandled } = press("ArrowDown", -1, 0);

			expect(setActiveIndex).not.toHaveBeenCalled();
			expect(isHandled).toBe(false);
		});

		it("SHOULD let the key through WHEN it does not navigate", () => {
			const { event, isHandled } = press("a", 0, 3);

			expect(event.preventDefault).not.toHaveBeenCalled();
			expect(isHandled).toBe(false);
		});
	});
});
