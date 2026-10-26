import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { boundedIntegerSchema } from "./boundedIntegerSchema.ts";

const schema = boundedIntegerSchema("Rating", 0, 20);

describe("boundedIntegerSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "the lower bound", value: 0 },
			{ reason: "between the bounds", value: 14 },
			{ reason: "the upper bound", value: 20 },
		])("SHOULD accept the number WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected types", () => {
		it.each([
			{ reason: "a number written as a string", value: "12" },
			{ reason: "null", value: null },
			{ reason: "NaN", value: Number.NaN },
		])(
			"SHOULD ask for a JSON number WHEN the value is $reason",
			({ value }) => {
				expect(getIssues(schema.safeParse(value))).toStrictEqual([
					{
						path: [],
						code: ValidationIssueCodeEnum.INVALID_TYPE,
						message:
							'Rating should be a JSON number, not text (e.g. 7, not "7")',
					},
				]);
			},
		);
	});

	describe("rejected values", () => {
		it("SHOULD reject a decimal number", () => {
			expect(getIssues(schema.safeParse(12.5))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.NOT_INTEGER,
					message: "Rating should be an integer (e.g. 7, not 7.5)",
				},
			]);
		});

		it("SHOULD reject a number below the lower bound", () => {
			expect(getIssues(schema.safeParse(-1))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					limit: 0,
					message: "Rating should be at least 0",
				},
			]);
		});

		it("SHOULD reject a number above the upper bound", () => {
			expect(getIssues(schema.safeParse(21))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_BIG,
					limit: 20,
					message: "Rating should be at most 20",
				},
			]);
		});
	});
});
