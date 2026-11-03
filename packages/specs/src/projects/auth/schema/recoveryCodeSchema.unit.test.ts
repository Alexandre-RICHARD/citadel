import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { recoveryCodeSchema } from "./recoveryCodeSchema.ts";

describe("recoveryCodeSchema.ts", () => {
	describe("accepted codes", () => {
		it.each([
			{ reason: "as displayed", value: "ABCDE-FG234" },
			{ reason: "without its dash", value: "ABCDEFG234" },
			{ reason: "in lowercase", value: "abcde-fg234" },
			{ reason: "with spaces", value: " ABCDE FG234 " },
		])(
			"SHOULD give the 10 characters WHEN the code is $reason",
			({ value }) => {
				expect(recoveryCodeSchema.parse(value)).toBe("ABCDEFG234");
			},
		);
	});

	describe("refused codes", () => {
		it.each([
			{ reason: "9 characters", value: "ABCDE-FG23" },
			{ reason: "11 characters", value: "ABCDE-FG2345" },
			{ reason: "a digit outside Base32", value: "ABCDE-FG231" },
			{ reason: "an accent", value: "ÉBCDE-FG234" },
		])("SHOULD refuse $reason", ({ value }) => {
			expect(getIssues(recoveryCodeSchema.safeParse(value))).toMatchObject([
				{ code: ValidationIssueCodeEnum.INVALID_FORMAT },
			]);
		});
	});
});
