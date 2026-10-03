import type { z } from "zod";

import { ValidationIssueCodeEnum } from "./validationIssueCode.enum.ts";
import type { ValidationIssueDto } from "./validationIssueDto.type.ts";

type IssueRule = Pick<ValidationIssueDto, "code" | "limit">;

function isValidationIssueCode(
	value: unknown,
): value is ValidationIssueCodeEnum {
	return Object.values<unknown>(ValidationIssueCodeEnum).includes(value);
}

// Zod nomme lui-même ses vérifications natives ; nos refine posent leur code dans `params.code`
function getIssueRule(issue: z.core.$ZodIssue): IssueRule {
	switch (issue.code) {
		case "invalid_type":
			return {
				code:
					issue.expected === "int"
						? ValidationIssueCodeEnum.NOT_INTEGER
						: ValidationIssueCodeEnum.INVALID_TYPE,
			};
		case "too_small":
			return {
				code:
					issue.origin === "string"
						? ValidationIssueCodeEnum.TOO_SHORT
						: ValidationIssueCodeEnum.TOO_SMALL,
				limit: Number(issue.minimum),
			};
		case "too_big":
			return {
				code:
					issue.origin === "string"
						? ValidationIssueCodeEnum.TOO_LONG
						: ValidationIssueCodeEnum.TOO_BIG,
				limit: Number(issue.maximum),
			};
		case "invalid_format":
			return { code: ValidationIssueCodeEnum.INVALID_FORMAT };
		case "custom": {
			const code: unknown = issue.params?.code;
			return {
				code: isValidationIssueCode(code)
					? code
					: ValidationIssueCodeEnum.INVALID_VALUE,
			};
		}
		default:
			return { code: ValidationIssueCodeEnum.INVALID_VALUE };
	}
}

// Partagé par le serveur (réponse 400) et le front (validation d'une saisie) : un seul traducteur côté front
export function fromZodIssueToValidationIssueDto(
	issue: z.core.$ZodIssue,
): ValidationIssueDto {
	return {
		path: issue.path.map((key) =>
			typeof key === "symbol" ? key.toString() : key,
		),
		...getIssueRule(issue),
		message: issue.message,
	};
}
