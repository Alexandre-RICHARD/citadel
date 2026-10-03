import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type.ts";
import { IdBoundEnum } from "@citadel/specs/src/specUtils/schemaValidator/id/idBound.enum.ts";

// Toutes les raisons de refuser un id de chemin, avec l'issue attendue pour ce libellé
export function buildInvalidPathIdCases(label: string): {
	reason: string;
	pathValue: string;
	issue: Omit<ValidationIssueDto, "path">;
}[] {
	const formatIssue = {
		code: ValidationIssueCodeEnum.INVALID_FORMAT,
		message: `${label} has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)`,
	};
	return [
		{ reason: "text", pathValue: "abc", issue: formatIssue },
		{
			reason: "a number followed by text",
			pathValue: "12abc",
			issue: formatIssue,
		},
		{ reason: "Infinity", pathValue: "Infinity", issue: formatIssue },
		{ reason: "a decimal", pathValue: "1.5", issue: formatIssue },
		{ reason: "a negative number", pathValue: "-7", issue: formatIssue },
		{
			reason: "preceded by a plus sign",
			pathValue: "+5",
			issue: formatIssue,
		},
		{
			reason: "written with leading zeros",
			pathValue: "007",
			issue: formatIssue,
		},
		{
			reason: "in scientific notation",
			pathValue: "1e3",
			issue: formatIssue,
		},
		{ reason: "in hexadecimal", pathValue: "0x10", issue: formatIssue },
		{ reason: "in binary", pathValue: "0b11", issue: formatIssue },
		{ reason: "a space", pathValue: "%20", issue: formatIssue },
		{
			reason: "surrounded by spaces",
			pathValue: "%207%20",
			issue: formatIssue,
		},
		{
			reason: "zero",
			pathValue: "0",
			issue: {
				code: ValidationIssueCodeEnum.TOO_SMALL,
				limit: IdBoundEnum.MIN,
				message: `${label} should be at least ${IdBoundEnum.MIN}`,
			},
		},
		{
			reason: "beyond the maximum of an INT column",
			pathValue: String(IdBoundEnum.MAX + 1),
			issue: {
				code: ValidationIssueCodeEnum.TOO_BIG,
				limit: IdBoundEnum.MAX,
				message: `${label} should be at most ${IdBoundEnum.MAX}`,
			},
		},
		{
			reason: "too long to be an exact JavaScript number",
			pathValue: "99999999999999999999",
			issue: {
				code: ValidationIssueCodeEnum.TOO_BIG,
				limit: IdBoundEnum.MAX,
				message: `${label} should be at most ${IdBoundEnum.MAX}`,
			},
		},
	];
}
