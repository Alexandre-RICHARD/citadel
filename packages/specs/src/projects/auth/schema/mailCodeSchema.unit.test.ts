import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { mailCodeSchema } from "./mailCodeSchema.ts";

describe("mailCodeSchema.ts", () => {
	describe("accepted codes", () => {
		it.each([
			{ reason: "typed as is", value: "042917" },
			{ reason: "pasted with spaces", value: " 042 917 " },
			{ reason: "pasted with a line break", value: "042917\n" },
		])("SHOULD give the 6 digits WHEN the code is $reason", ({ value }) => {
			expect(mailCodeSchema.parse(value)).toBe("042917");
		});
	});

	describe("refused codes", () => {
		it.each([
			{ reason: "5 digits", value: "04291" },
			{ reason: "7 digits", value: "0429170" },
			{ reason: "a letter", value: "04291a" },
		])("SHOULD refuse $reason", ({ value }) => {
			expect(getIssues(mailCodeSchema.safeParse(value))).toMatchObject([
				{ code: ValidationIssueCodeEnum.INVALID_FORMAT },
			]);
		});
	});
});
