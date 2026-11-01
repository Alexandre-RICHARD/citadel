import { describe, expect, it } from "vitest";

import { formatDateTime } from "./formatDateTime";

describe("formatDateTime.ts", () => {
	describe("format", () => {
		it("SHOULD give the short day, date and time WHEN formatting a date", () => {
			expect(formatDateTime(new Date(2026, 10, 1, 5, 0))).toBe(
				"dim. 1 nov., 05:00",
			);
		});
	});
});
