import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { requiredStringSchema } from "./requiredStringSchema.ts";

const MAX_LENGTH = 10;
const schema = requiredStringSchema("Name", MAX_LENGTH);

describe("requiredStringSchema.ts", () => {
	describe("accepted strings", () => {
		it.each([
			{ reason: "a single character", value: "a", data: "a" },
			{
				reason: "exactly the maximum length",
				value: "Hades II !",
				data: "Hades II !",
			},
			{
				reason: "surrounding spaces, removed",
				value: "  Hades \t",
				data: "Hades",
			},
			{
				reason: "surrounding line breaks, removed",
				value: "\nCeleste\r\n",
				data: "Celeste",
			},
			{
				reason: "too long only before its spaces are removed",
				value: "   Hades II !   ",
				data: "Hades II !",
			},
			{ reason: "inner spaces, kept", value: "Ori   Wisp", data: "Ori   Wisp" },
			{
				reason: "accents and ideograms",
				value: "Ōkami 大神",
				data: "Ōkami 大神",
			},
			{ reason: "a whole emoji", value: "Hades 🔥", data: "Hades 🔥" },
			// Zod compte les caractères comme la colonne utf8mb4 : un emoji vaut 1, pas les 2 unités de .length en JavaScript
			{
				reason: "as many emojis as the maximum length",
				value: "🔥".repeat(MAX_LENGTH),
				data: "🔥".repeat(MAX_LENGTH),
			},
			{
				reason: "the NUL character, stored as is by the database",
				value: "a\u0000b",
				data: "a\u0000b",
			},
		])("SHOULD accept the string WHEN it has $reason", ({ value, data }) => {
			expect(schema.safeParse(value)).toStrictEqual({ success: true, data });
		});
	});

	describe("rejected types", () => {
		it.each([
			{ reason: "a number", value: 42 },
			{ reason: "null", value: null },
			{ reason: "undefined", value: undefined },
			{ reason: "an array", value: ["Cuphead"] },
			{ reason: "a boolean", value: true },
		])("SHOULD ask for a string WHEN the value is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: "Name should be a string",
				},
			]);
		});
	});

	describe("rejected lengths", () => {
		it.each([
			{ reason: "empty", value: "" },
			{ reason: "only spaces", value: "   " },
			{ reason: "only tabs and line breaks", value: "\t\n\r" },
		])(
			"SHOULD ask for at least one character WHEN the string is $reason",
			({ value }) => {
				expect(getIssues(schema.safeParse(value))).toStrictEqual([
					{
						path: [],
						code: ValidationIssueCodeEnum.TOO_SHORT,
						limit: 1,
						message: "Name should contain at least 1 character",
					},
				]);
			},
		);

		it.each([
			{ reason: "one character too many", value: "Hades II !!" },
			{ reason: "one emoji too many", value: "🔥".repeat(MAX_LENGTH + 1) },
		])("SHOULD reject the string WHEN it has $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_LONG,
					limit: MAX_LENGTH,
					message: `Name should contain at most ${MAX_LENGTH} characters`,
				},
			]);
		});
	});

	describe("rejected characters", () => {
		it.each([
			{ reason: "an isolated first half of an emoji", value: "Elden \uD83D" },
			{ reason: "an isolated second half of an emoji", value: "\uDC00 Ring" },
			{ reason: "two halves in the wrong order", value: "a\uDC00\uD83Db" },
		])(
			"SHOULD reject the string WHEN it contains $reason, that the database would replace with �",
			({ value }) => {
				expect(getIssues(schema.safeParse(value))).toStrictEqual([
					{
						path: [],
						code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
						message: "Name should not contain invalid characters",
					},
				]);
			},
		);
	});
});
