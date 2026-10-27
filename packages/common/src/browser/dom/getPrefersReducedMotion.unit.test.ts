import { afterEach, describe, expect, it, vi } from "vitest";

import { getPrefersReducedMotion } from "./getPrefersReducedMotion.ts";
import { REDUCED_MOTION_QUERY } from "./reducedMotionQuery.ts";

function stubMatchMedia(matches: boolean) {
	const matchMedia = vi.fn(() => ({ matches }) as MediaQueryList);
	vi.stubGlobal("matchMedia", matchMedia);
	return matchMedia;
}

describe("getPrefersReducedMotion.ts", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("user preference", () => {
		it.each([true, false])(
			"SHOULD return the media query result WHEN it is %s",
			(matches) => {
				const matchMedia = stubMatchMedia(matches);

				expect(getPrefersReducedMotion()).toBe(matches);
				expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
			},
		);
	});
});
