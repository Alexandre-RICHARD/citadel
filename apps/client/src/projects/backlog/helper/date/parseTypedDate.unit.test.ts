import { describe, expect, it } from "vitest";

import { parseTypedDate } from "./parseTypedDate";

describe("parseTypedDate.ts", () => {
	describe("accepted formats", () => {
		it.each([
			{ text: "17/09/2013", format: "day first with slashes" },
			{ text: "17.09.2013", format: "day first with dots" },
			{ text: "17-09-2013", format: "day first with dashes" },
			{ text: "17092013", format: "digits only" },
			{ text: "2013-09-17", format: "ISO" },
			{ text: "  17/09/2013  ", format: "surrounded by spaces" },
		])("SHOULD read the date WHEN it is written $format", ({ text }) => {
			expect(parseTypedDate(text)).toBe("2013-09-17");
		});

		it("SHOULD pad the day and the month WHEN they have one digit", () => {
			expect(parseTypedDate("1/9/2013")).toBe("2013-09-01");
		});
	});

	describe("rejected input", () => {
		it.each([
			{ reason: "the date is incomplete", text: "17/09/201" },
			{ reason: "the day does not exist", text: "31/02/2024" },
			{ reason: "the month does not exist", text: "01/13/2024" },
			{ reason: "the year has fewer than 4 digits", text: "0201-01-01" },
			{ reason: "the text is not a date", text: "hier" },
			{ reason: "the text is empty", text: "" },
		])("SHOULD return null WHEN $reason", ({ text }) => {
			expect(parseTypedDate(text)).toBeNull();
		});
	});
});
