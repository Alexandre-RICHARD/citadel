import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { seriesNumberSchema } from "./seriesNumberSchema.ts";

const schema = seriesNumberSchema("Series number");

describe("seriesNumberSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "the first number", value: 1 },
			{ reason: "a sub game with 3 decimals", value: 3.155 },
			{ reason: "a number with floating point noise", value: 0.1 + 3 },
			{ reason: "the largest number", value: 9999.999 },
		])("SHOULD accept the number WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value).success).toBe(true);
		});
	});

	describe("rejected values", () => {
		it("SHOULD give the decimal limit WHEN the number has 4 decimals", () => {
			expect(getIssues(schema.safeParse(3.1555))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_MANY_DECIMALS,
					limit: 3,
					message: "Series number should have at most 3 decimals",
				},
			]);
		});

		it.each([
			{
				reason: "below 1",
				value: 0.5,
				message: "Series number should be at least 1",
			},
			{
				reason: "above the largest number",
				value: 10_000,
				message: "Series number should be at most 9999.999",
			},
		])("SHOULD refuse the number WHEN it is $reason", ({ value, message }) => {
			expect(
				getIssues(schema.safeParse(value)).map((issue) => issue.message),
			).toStrictEqual([message]);
		});
	});
});
