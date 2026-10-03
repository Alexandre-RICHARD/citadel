import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type.ts";

const TYPE_ISSUE = {
	code: ValidationIssueCodeEnum.INVALID_TYPE,
	message: "Name should be a string",
};

const EMPTY_ISSUE = {
	code: ValidationIssueCodeEnum.TOO_SHORT,
	limit: 1,
	message: "Name should contain at least 1 character",
};

// Toutes les raisons de refuser un nom de jeu ou de boss (VARCHAR 255, obligatoire, trim).
// `name: undefined` disparaît à la sérialisation JSON : c'est le cas du champ absent
export const INVALID_NAME_CASES: {
	reason: string;
	name: unknown;
	issue: Omit<ValidationIssueDto, "path">;
}[] = [
	{ reason: "the name is missing", name: undefined, issue: TYPE_ISSUE },
	{ reason: "the name is null", name: null, issue: TYPE_ISSUE },
	{ reason: "the name is a number", name: 42, issue: TYPE_ISSUE },
	{ reason: "the name is an array", name: ["Cuphead"], issue: TYPE_ISSUE },
	{ reason: "the name is empty", name: "", issue: EMPTY_ISSUE },
	{
		reason: "the name only contains spaces, tabs and line breaks",
		name: " \t\n ",
		issue: EMPTY_ISSUE,
	},
	{
		reason:
			"the name contains an isolated half of an emoji, that the database would replace with �",
		name: "Elden \uD83D Ring",
		issue: {
			code: ValidationIssueCodeEnum.INVALID_CHARACTERS,
			message: "Name should not contain invalid characters",
		},
	},
	{
		reason: "the name exceeds 255 characters",
		name: "Dark Souls III ".repeat(18).slice(0, 256),
		issue: {
			code: ValidationIssueCodeEnum.TOO_LONG,
			limit: 255,
			message: "Name should contain at most 255 characters",
		},
	},
];
