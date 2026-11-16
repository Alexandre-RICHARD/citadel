import { describe, expect, it } from "vitest";

import { tmdbCheckSliceSize } from "./tmdbCheckSliceSize.ts";

describe("tmdbCheckSliceSize.ts", () => {
	describe("slice", () => {
		it("SHOULD check a seventh of the media each night, rounded up", () => {
			expect(tmdbCheckSliceSize(3000)).toBe(429);
			expect(tmdbCheckSliceSize(0)).toBe(1);
		});
	});
});
