import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useWheelStep } from "./useWheelStep.tsx";

function renderOnElement(onStep: (step: -1 | 1) => void) {
	const element = document.createElement("div");
	renderHook(() => useWheelStep({ current: element }, onStep));
	return element;
}

function wheel(element: HTMLElement, deltaY: number): WheelEvent {
	const event = new WheelEvent("wheel", { deltaY, cancelable: true });
	element.dispatchEvent(event);
	return event;
}

describe("useWheelStep.tsx", () => {
	describe("wheel over the element", () => {
		it("SHOULD step down WHEN the wheel scrolls down", () => {
			const onStep = vi.fn();
			const element = renderOnElement(onStep);

			wheel(element, 100);

			expect(onStep).toHaveBeenCalledExactlyOnceWith(1);
		});

		it("SHOULD step up WHEN the wheel scrolls up", () => {
			const onStep = vi.fn();
			const element = renderOnElement(onStep);

			wheel(element, -100);

			expect(onStep).toHaveBeenCalledExactlyOnceWith(-1);
		});

		it("SHOULD keep the page from scrolling", () => {
			const element = renderOnElement(vi.fn());

			const event = wheel(element, 100);

			expect(event.defaultPrevented).toBe(true);
		});

		it("SHOULD step once WHEN small scrolls add up to a notch", () => {
			const onStep = vi.fn();
			const element = renderOnElement(onStep);

			wheel(element, 20);
			wheel(element, 20);
			expect(onStep).not.toHaveBeenCalled();
			wheel(element, 20);

			expect(onStep).toHaveBeenCalledExactlyOnceWith(1);
		});
	});

	describe("unmount", () => {
		it("SHOULD stop listening to the wheel", () => {
			const onStep = vi.fn();
			const element = document.createElement("div");
			const { unmount } = renderHook(() =>
				useWheelStep({ current: element }, onStep),
			);

			unmount();
			wheel(element, 100);

			expect(onStep).not.toHaveBeenCalled();
		});
	});
});
