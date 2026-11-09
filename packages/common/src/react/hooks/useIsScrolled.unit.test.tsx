import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useIsScrolled } from "./useIsScrolled.tsx";

function scrollTo(scrollY: number) {
	Object.defineProperty(window, "scrollY", {
		value: scrollY,
		configurable: true,
	});
	act(() => {
		window.dispatchEvent(new Event("scroll"));
	});
}

describe("useIsScrolled.tsx", () => {
	afterEach(() => {
		scrollTo(0);
	});

	describe("top of the page", () => {
		it("SHOULD be false WHEN the page is not scrolled", () => {
			const { result } = renderHook(() => useIsScrolled(200));

			expect(result.current).toBe(false);
		});
	});

	describe("scrolling", () => {
		it("SHOULD be true WHEN the page is scrolled past the threshold", () => {
			const { result } = renderHook(() => useIsScrolled(200));

			scrollTo(201);

			expect(result.current).toBe(true);
		});

		it("SHOULD stay false WHEN the page is scrolled exactly to the threshold", () => {
			const { result } = renderHook(() => useIsScrolled(200));

			scrollTo(200);

			expect(result.current).toBe(false);
		});

		it("SHOULD turn false again WHEN the page goes back above the threshold", () => {
			const { result } = renderHook(() => useIsScrolled(200));
			scrollTo(500);

			scrollTo(10);

			expect(result.current).toBe(false);
		});
	});

	describe("page already scrolled", () => {
		it("SHOULD be true from the first render", () => {
			Object.defineProperty(window, "scrollY", {
				value: 900,
				configurable: true,
			});

			const { result } = renderHook(() => useIsScrolled(200));

			expect(result.current).toBe(true);
		});
	});

	describe("unmount", () => {
		it("SHOULD stop listening to the scroll", () => {
			const { result, unmount } = renderHook(() => useIsScrolled(200));

			unmount();
			scrollTo(500);

			expect(result.current).toBe(false);
		});
	});
});
