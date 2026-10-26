import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { queryParamPageSchema } from "./queryParamPageSchema.ts";

const schema = queryParamPageSchema("Page");

describe("queryParamPageSchema.ts", () => {
	describe("accepted values", () => {
		it("SHOULD read the page number from the query text", () => {
			expect(schema.safeParse("3")).toStrictEqual({ success: true, data: 3 });
		});

		it("SHOULD give the first page WHEN the parameter is absent", () => {
			expect(schema.safeParse(undefined)).toStrictEqual({
				success: true,
				data: 1,
			});
		});
	});

	describe("rejected values", () => {
		it("SHOULD reject the page zero", () => {
			expect(getIssues(schema.safeParse("0"))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.TOO_SMALL,
					limit: 1,
					message: "Page should be at least 1",
				},
			]);
		});

		it("SHOULD reject a page number that is not written in digits", () => {
			expect(getIssues(schema.safeParse("two"))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
					message:
						"Page has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)",
				},
			]);
		});
	});
});
