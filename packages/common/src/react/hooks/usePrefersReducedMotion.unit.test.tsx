import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { REDUCED_MOTION_QUERY } from "../../browser/dom/reducedMotionQuery.ts";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion.tsx";

describe("usePrefersReducedMotion.tsx", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("user preference", () => {
		it("SHOULD read the reduced motion media query", () => {
			const matchMedia = vi.fn(() => ({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}));
			vi.stubGlobal("matchMedia", matchMedia);

			const { result } = renderHook(() => usePrefersReducedMotion());

			expect(result.current).toBe(true);
			expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
		});
	});
});
