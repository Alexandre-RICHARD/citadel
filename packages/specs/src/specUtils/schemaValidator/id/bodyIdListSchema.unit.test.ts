import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { bodyIdListSchema } from "./bodyIdListSchema.ts";

const schema = bodyIdListSchema("Version IDs");

describe("bodyIdListSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "empty", value: [] },
			{ reason: "made of distinct ids", value: [3, 1, 2] },
		])("SHOULD keep the list as is WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected values", () => {
		it("SHOULD reject a list that is not an array", () => {
			expect(getIssues(schema.safeParse(3))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.INVALID_TYPE,
					message: "Version IDs should be an array of ids",
				},
			]);
		});

		it("SHOULD point to the invalid item WHEN an id is not valid", () => {
			expect(getIssues(schema.safeParse([4, 0]))).toStrictEqual([
				{
					path: [1],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					limit: 1,
					message: "Version IDs item should be at least 1",
				},
			]);
		});

		it("SHOULD reject a list WHEN an id appears twice", () => {
			expect(getIssues(schema.safeParse([7, 8, 7]))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.DUPLICATE_VALUE,
					message: "Version IDs should not contain the same id twice",
				},
			]);
		});

		it("SHOULD reject a list longer than 500 ids", () => {
			const ids = Array.from({ length: 501 }, (_, index) => index + 1);
			expect(getIssues(schema.safeParse(ids))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_BIG,
					limit: 500,
					message: "Version IDs should contain at most 500 ids",
				},
			]);
		});
	});
});
