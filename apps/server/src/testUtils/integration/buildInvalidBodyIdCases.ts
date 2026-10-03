import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type.ts";
import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id du corps : contrairement au chemin, aucune conversion depuis une chaîne
export function buildInvalidBodyIdCases(label: string): {
	reason: string;
	value: unknown;
	issue: Omit<ValidationIssueDto, "path">;
}[] {
	const typeIssue = {
		code: ValidationIssueCodeEnum.INVALID_TYPE,
		message: `${label} should be a JSON number, not text (e.g. 7, not "7")`,
	};
	const minimumIssue = {
		code: ValidationIssueCodeEnum.TOO_SMALL,
		limit: IdBoundEnum.MIN,
		message: `${label} should be at least ${IdBoundEnum.MIN}`,
	};
	return [
		{ reason: "missing", value: undefined, issue: typeIssue },
		{ reason: "null", value: null, issue: typeIssue },
		{ reason: "a number written as a string", value: "3", issue: typeIssue },
		{
			reason: "a decimal",
			value: 1.5,
			issue: {
				code: ValidationIssueCodeEnum.NOT_INTEGER,
				message: `${label} should be an integer (e.g. 7, not 7.5)`,
			},
		},
		{ reason: "zero", value: 0, issue: minimumIssue },
		{ reason: "a negative number", value: -2, issue: minimumIssue },
		{
			reason: "beyond the maximum of an INT column",
			value: IdBoundEnum.MAX + 1,
			issue: {
				code: ValidationIssueCodeEnum.TOO_BIG,
				limit: IdBoundEnum.MAX,
				message: `${label} should be at most ${IdBoundEnum.MAX}`,
			},
		},
	];
}
