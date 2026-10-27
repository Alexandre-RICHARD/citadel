import { afterEach, describe, expect, it, vi } from "vitest";

import { getTodayIsoDate } from "./getTodayIsoDate.ts";

describe("getTodayIsoDate.ts", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe("today", () => {
		it("SHOULD return the local day WHEN it is late in the evening", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 9, 21, 23, 30));

			expect(getTodayIsoDate()).toBe("2026-10-21");
		});
	});
});
