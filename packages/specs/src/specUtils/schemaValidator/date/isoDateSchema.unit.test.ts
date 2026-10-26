import { describe, expect, it } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { isoDateSchema } from "./isoDateSchema.ts";

const schema = isoDateSchema("Finish date");

const FORMAT_ISSUE = {
	path: [],
	code: ValidationIssueCodeEnum.INVALID_FORMAT,
	message: "Finish date should be an ISO 8601 date (e.g. 2026-10-21)",
};

describe("isoDateSchema.ts", () => {
	describe("accepted values", () => {
		it.each([
			{ reason: "a common day", value: "2026-10-21" },
			{ reason: "a leap day", value: "2024-02-29" },
			{ reason: "the oldest day a DATE column stores", value: "1000-01-01" },
			{ reason: "in the future", value: "2999-12-31" },
		])("SHOULD keep the date as is WHEN it is $reason", ({ value }) => {
			expect(schema.safeParse(value)).toStrictEqual({
				success: true,
				data: value,
			});
		});
	});

	describe("rejected formats", () => {
		it.each([
			{ reason: "a French date", value: "21/10/2026" },
			{ reason: "a date with a time", value: "2026-10-21T10:00:00.000Z" },
			{ reason: "a day that does not exist", value: "2026-02-30" },
			{ reason: "a February 29th outside a leap year", value: "2025-02-29" },
			{ reason: "without leading zeros", value: "2026-1-5" },
			{ reason: "empty", value: "" },
		])("SHOULD reject the date WHEN it is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([FORMAT_ISSUE]);
		});

		it("SHOULD reject a number", () => {
			expect(getIssues(schema.safeParse(20261021))).toStrictEqual([
				{ ...FORMAT_ISSUE, code: ValidationIssueCodeEnum.INVALID_TYPE },
			]);
		});
	});

	describe("rejected values", () => {
		it("SHOULD reject a date before the year 1000", () => {
			expect(getIssues(schema.safeParse("0999-12-31"))).toStrictEqual([
				{
					path: [],
					code: ValidationIssueCodeEnum.DATE_TOO_OLD,
					message: "Finish date should not be before 1000-01-01",
				},
			]);
		});
	});
});
