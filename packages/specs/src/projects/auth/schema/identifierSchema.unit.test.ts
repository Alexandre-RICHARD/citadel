import { describe, expect, it } from "vitest";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { getIssues } from "../../../testUtils/getIssues.ts";
import { identifierSchema } from "./identifierSchema.ts";

describe("identifierSchema.ts", () => {
	describe("accepted identifiers", () => {
		it.each([
			{ reason: "a username", value: "Alex" },
			{ reason: "an email", value: "alex@example.com" },
			{ reason: "a text in no known format", value: "Élodie la Grande" },
		])("SHOULD keep $reason", ({ value }) => {
			expect(identifierSchema.parse(value)).toBe(value);
		});

		it("SHOULD remove the spaces around the identifier", () => {
			expect(identifierSchema.parse(" Alex ")).toBe("Alex");
		});
	});

	describe("refused identifiers", () => {
		it.each([
			{
				reason: "an empty identifier",
				value: "  ",
				code: ValidationIssueCodeEnum.TOO_SHORT,
			},
			{
				reason: "255 characters",
				value: "a".repeat(255),
				code: ValidationIssueCodeEnum.TOO_LONG,
			},
		])("SHOULD refuse $reason", ({ value, code }) => {
			expect(getIssues(identifierSchema.safeParse(value))).toMatchObject([
				{ code },
			]);
		});
	});
});
