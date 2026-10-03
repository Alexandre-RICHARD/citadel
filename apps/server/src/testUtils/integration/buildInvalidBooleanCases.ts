import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type.ts";

// Toutes les raisons de refuser un booléen du corps. `value: undefined` : champ absent du JSON
export function buildInvalidBooleanCases(label: string): {
	reason: string;
	value: unknown;
	issue: Omit<ValidationIssueDto, "path">;
}[] {
	const issue = {
		code: ValidationIssueCodeEnum.INVALID_TYPE,
		message: `${label} should be a boolean`,
	};
	return [
		{ reason: "missing", value: undefined, issue },
		{ reason: "null", value: null, issue },
		{ reason: 'the string "true"', value: "true", issue },
		{ reason: "the number 1", value: 1, issue },
		{ reason: "the number 0", value: 0, issue },
	];
}
