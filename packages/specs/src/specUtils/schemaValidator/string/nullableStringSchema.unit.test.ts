import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { nullableStringSchema } from "./nullableStringSchema.ts";

const MAX_LENGTH = 12;
const boundedSchema = nullableStringSchema("Comment", MAX_LENGTH);
const unboundedSchema = nullableStringSchema("Stack");

describe("nullableStringSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{
				reason: "a text, without its surrounding spaces",
				value: "  Too hard  ",
				data: "Too hard",
			},
			{
				reason: "exactly the maximum length",
				value: "Missed again",
				data: "Missed again",
			},
			{ reason: "null, kept", value: null, data: null },
			{ reason: "an empty string, turned into null", value: "", data: null },
			{ reason: "only spaces, turned into null", value: " \t\n ", data: null },
			{ reason: "a whole emoji", value: "Missed 🦊", data: "Missed 🦊" },
		])("SHOULD accept the value WHEN it is $reason", ({ value, data }) => {
			expect(boundedSchema.safeParse(value)).toStrictEqual({
				success: true,
				data,
			});
		});

		it("SHOULD accept a very long text WHEN there is no maximum length (LONGTEXT column)", () => {
			const longStack = "at foo (bar.ts:1:1)\n".repeat(10_000).trim();

			expect(unboundedSchema.safeParse(longStack)).toStrictEqual({
				success: true,
				data: longStack,
			});
		});
	});

	describe("rejected values", () => {
		it.each([
			{ reason: "a number", value: 5 },
			{ reason: "undefined, since null must be explicit", value: undefined },
			{ reason: "a boolean", value: false },
			{ reason: "an array", value: ["Missed"] },
		])("SHOULD ask for a string WHEN the value is $reason", ({ value }) => {
			expect(getIssues(boundedSchema.safeParse(value))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: "Comment should be a string",
				},
			]);
		});

		it("SHOULD reject a text WHEN it exceeds the maximum length once its spaces are removed", () => {
			expect(
				getIssues(boundedSchema.safeParse("  Missed again!  ")),
			).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_LONG,
					limit: MAX_LENGTH,
					message: `Comment should contain at most ${MAX_LENGTH} characters`,
				},
			]);
		});

		it.each([
			{ reason: "an isolated first half of an emoji", value: "Missed \uD83D" },
			{ reason: "an isolated second half of an emoji", value: "\uDC00 missed" },
		])(
			"SHOULD reject the text WHEN it contains $reason, that the database would replace with �",
			({ value }) => {
				expect(getIssues(boundedSchema.safeParse(value))).toStrictEqual([
					{
						path: [],
						code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
						message: "Comment should not contain invalid characters",
					},
				]);
			},
		);
	});
});
