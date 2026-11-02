import { describe, expect, it } from "vitest";

import { isSessionDueForProlongation } from "./isSessionDueForProlongation.ts";

const TOUCH_MS = 5 * 60 * 1000;
const LAST_SEEN_AT = new Date("2026-11-02T10:00:00.000Z");

describe("isSessionDueForProlongation.ts", () => {
	describe("period", () => {
		it("SHOULD wait WHEN the last visit is less than 5 minutes old", () => {
			const now = new Date(LAST_SEEN_AT.getTime() + TOUCH_MS - 1);

			expect(isSessionDueForProlongation(LAST_SEEN_AT, now, TOUCH_MS)).toBe(
				false,
			);
		});

		it("SHOULD prolong WHEN the last visit is exactly 5 minutes old", () => {
			const now = new Date(LAST_SEEN_AT.getTime() + TOUCH_MS);

			expect(isSessionDueForProlongation(LAST_SEEN_AT, now, TOUCH_MS)).toBe(
				true,
			);
		});
	});
});
