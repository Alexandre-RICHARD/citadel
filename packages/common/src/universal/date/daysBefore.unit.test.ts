import { describe, expect, it } from "vitest";

import { daysBefore } from "./daysBefore.ts";

describe("daysBefore.ts", () => {
	describe("result", () => {
		it("SHOULD go back whole days of 24 hours WHEN given a number of days", () => {
			// Act
			const result = daysBefore(new Date("2026-11-08T10:30:00.000Z"), 7);

			// Assert
			expect(result.toISOString()).toBe("2026-11-01T10:30:00.000Z");
		});
	});
});
