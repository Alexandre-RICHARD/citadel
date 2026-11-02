import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";

function countCharacters(value: string): number {
	return Array.from(value).length;
}

/**
 * 12 à 128 caractères, sans règle de composition. Normalisé en NFC avant d'être compté puis hashé : un « é » tapé en une
 * ou en deux touches compte pour un caractère, et donne le même hash. Jamais de trim : un espace en fait partie
 */
export const passwordSchema = z
	.string({ message: "Password should be a string" })
	.transform((value) => value.normalize("NFC"))
	.refine((value) => value.isWellFormed(), {
		message: "Password should not contain invalid characters",
		params: { code: ValidationIssueCodeEnum.INVALID_CHARACTERS },
	})
	.refine((value) => countCharacters(value) >= AUTH_FIELD_LENGTHS.passwordMin, {
		message: `Password should contain at least ${AUTH_FIELD_LENGTHS.passwordMin} characters`,
		params: {
			code: ValidationIssueCodeEnum.TOO_SHORT,
			limit: AUTH_FIELD_LENGTHS.passwordMin,
		},
	})
	.refine((value) => countCharacters(value) <= AUTH_FIELD_LENGTHS.passwordMax, {
		message: `Password should contain at most ${AUTH_FIELD_LENGTHS.passwordMax} characters`,
		params: {
			code: ValidationIssueCodeEnum.TOO_LONG,
			limit: AUTH_FIELD_LENGTHS.passwordMax,
		},
	});
