import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./useMediaQuery.tsx";

// Une media query dont le test choisit le résultat, et prévient ses abonnés quand il change
function stubMediaQuery(initialMatches: boolean) {
	let matches = initialMatches;
	const listeners = new Set<() => void>();
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({
			get matches() {
				return matches;
			},
			addEventListener: (_type: string, listener: () => void) =>
				listeners.add(listener),
			removeEventListener: (_type: string, listener: () => void) =>
				listeners.delete(listener),
		})),
	);
	return {
		listeners,
		change(nextMatches: boolean) {
			matches = nextMatches;
			listeners.forEach((listener) => listener());
		},
	};
}

describe("useMediaQuery.tsx", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("initial value", () => {
		it.each([true, false])(
			"SHOULD return the current result WHEN the query is %s",
			(matches) => {
				stubMediaQuery(matches);

				const { result } = renderHook(() => useMediaQuery("(min-width: 1px)"));

				expect(result.current).toBe(matches);
			},
		);
	});

	describe("changes", () => {
		it("SHOULD follow the query WHEN its result changes", () => {
			const mediaQuery = stubMediaQuery(false);
			const { result } = renderHook(() => useMediaQuery("(min-width: 1px)"));

			act(() => {
				mediaQuery.change(true);
			});

			expect(result.current).toBe(true);
		});

		it("SHOULD stop listening WHEN the component unmounts", () => {
			const mediaQuery = stubMediaQuery(false);
			const { unmount } = renderHook(() => useMediaQuery("(min-width: 1px)"));

			unmount();

			expect(mediaQuery.listeners.size).toBe(0);
		});
	});
});
