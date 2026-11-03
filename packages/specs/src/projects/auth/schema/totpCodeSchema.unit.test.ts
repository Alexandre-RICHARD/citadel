import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { totpCodeSchema } from "./totpCodeSchema.ts";

describe("totpCodeSchema.ts", () => {
	describe("accepted codes", () => {
		it.each([
			{ reason: "typed as is", value: "042917" },
			{ reason: "copied with the space of the application", value: "042 917" },
		])("SHOULD give the 6 digits WHEN the code is $reason", ({ value }) => {
			expect(totpCodeSchema.parse(value)).toBe("042917");
		});
	});

	describe("refused codes", () => {
		it.each([
			{ reason: "5 digits", value: "04291" },
			{ reason: "8 digits", value: "04291700" },
			{ reason: "a letter", value: "04291a" },
		])("SHOULD refuse $reason", ({ value }) => {
			expect(getIssues(totpCodeSchema.safeParse(value))).toMatchObject([
				{ code: ValidationIssueCodeEnum.INVALID_FORMAT },
			]);
		});
	});
});
