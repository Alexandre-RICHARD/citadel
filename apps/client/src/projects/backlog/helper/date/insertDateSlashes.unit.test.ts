import { describe, expect, it } from "vitest";

import { insertDateSlashes } from "./insertDateSlashes";

describe("insertDateSlashes.ts", () => {
	describe("digits being typed", () => {
		it.each([
			{ text: "1", expected: "1" },
			{ text: "17", expected: "17" },
			{ text: "170", expected: "17/0" },
			{ text: "1709", expected: "17/09" },
			{ text: "17092", expected: "17/09/2" },
			{ text: "17092013", expected: "17/09/2013" },
		])(
			"SHOULD write $expected WHEN the text is $text",
			({ text, expected }) => {
				expect(insertDateSlashes(text)).toBe(expected);
			},
		);

		it("SHOULD keep 8 digits at most", () => {
			expect(insertDateSlashes("170920139")).toBe("17/09/2013");
		});

		it("SHOULD keep the slashes already at their place", () => {
			expect(insertDateSlashes("17/09/2")).toBe("17/09/2");
		});
	});

	describe("own format", () => {
		it.each([
			{ reason: "the slashes are elsewhere", text: "1/9/2013" },
			{ reason: "the text ends with a slash, being erased", text: "17/" },
			{ reason: "the text has other characters", text: "17.09.2013" },
		])("SHOULD leave the text as is WHEN $reason", ({ text }) => {
			expect(insertDateSlashes(text)).toBe(text);
		});
	});
});
