import { describe, expect, it } from "vitest";

import { parseAutoStop } from "./parseAutoStop";

describe("parseAutoStop.ts", () => {
	describe("labels", () => {
		it("SHOULD give seconds WHEN the label is in hours", () => {
			expect(parseAutoStop("3h")).toBe(10_800);
		});

		it("SHOULD give seconds WHEN the label is in minutes", () => {
			expect(parseAutoStop("30m")).toBe(1800);
		});

		it("SHOULD return null WHEN the label is unreadable", () => {
			expect(parseAutoStop("3 heures")).toBeNull();
		});
	});
});
