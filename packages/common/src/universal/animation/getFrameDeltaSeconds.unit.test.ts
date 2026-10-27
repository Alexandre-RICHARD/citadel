import { describe, expect, it } from "vitest";

import { getFrameDeltaSeconds } from "./getFrameDeltaSeconds.ts";

describe("getFrameDeltaSeconds.ts", () => {
	describe("regular frame", () => {
		it("SHOULD convert the elapsed milliseconds to seconds", () => {
			expect(getFrameDeltaSeconds(1016, 1000)).toBeCloseTo(0.016);
		});
	});

	describe("long pause", () => {
		it("SHOULD cap the delta at 0.05 s WHEN the previous frame is old", () => {
			expect(getFrameDeltaSeconds(5000, 1000)).toBe(0.05);
		});
	});
});
