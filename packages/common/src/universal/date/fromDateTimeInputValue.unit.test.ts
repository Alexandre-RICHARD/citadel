import { describe, expect, it } from "vitest";

import { fromDateTimeInputValue } from "./fromDateTimeInputValue.ts";

describe("fromDateTimeInputValue.ts", () => {
	describe("filled input", () => {
		it("SHOULD read the value as local time and return it as ISO", () => {
			expect(fromDateTimeInputValue("2019-03-05T07:04")).toBe(
				new Date(2019, 2, 5, 7, 4).toISOString(),
			);
		});
	});

	describe("unusable input", () => {
		it.each([
			{ reason: "the input is empty", value: "" },
			{ reason: "the value is not a date", value: "2019-13-45T99:99" },
		])("SHOULD return null WHEN $reason", ({ value }) => {
			expect(fromDateTimeInputValue(value)).toBeNull();
		});
	});
});
