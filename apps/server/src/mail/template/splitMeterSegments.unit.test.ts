import { describe, expect, it } from "vitest";

import { splitMeterSegments } from "./splitMeterSegments.ts";

describe("splitMeterSegments.ts", () => {
	describe("segments", () => {
		it("SHOULD cut at each mark and fill up to the value WHEN the value falls on a mark", () => {
			expect(splitMeterSegments(250, 300, [250, 280])).toStrictEqual([
				{ from: 0, to: 250 / 300, isFilled: true, endsAtMark: true },
				{ from: 250 / 300, to: 280 / 300, isFilled: false, endsAtMark: true },
				{ from: 280 / 300, to: 1, isFilled: false, endsAtMark: false },
			]);
		});

		it("SHOULD also cut where the value stops, without a gap there, WHEN the value falls between two marks", () => {
			expect(splitMeterSegments(150, 300, [250])).toStrictEqual([
				{ from: 0, to: 0.5, isFilled: true, endsAtMark: false },
				{ from: 0.5, to: 250 / 300, isFilled: false, endsAtMark: true },
				{ from: 250 / 300, to: 1, isFilled: false, endsAtMark: false },
			]);
		});

		it("SHOULD fill every segment WHEN the value reaches the maximum", () => {
			const segments = splitMeterSegments(320, 300, [250, 280]);

			expect(segments.every(({ isFilled }) => isFilled)).toBe(true);
			expect(segments.at(-1)?.to).toBe(1);
		});
	});

	describe("edge cases", () => {
		it("SHOULD ignore the marks outside the gauge", () => {
			expect(splitMeterSegments(0, 100, [0, 100, 150])).toStrictEqual([
				{ from: 0, to: 1, isFilled: false, endsAtMark: false },
			]);
		});

		it("SHOULD return a single full segment WHEN the maximum is zero", () => {
			expect(splitMeterSegments(0, 0, [])).toStrictEqual([
				{ from: 0, to: 1, isFilled: true, endsAtMark: false },
			]);
		});
	});
});
