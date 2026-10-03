import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";

/**
 * Une chaîne vide (après trim) devient `null`, comme un `null` explicite.
 * @param maxLength Absent pour une colonne sans limite pratique (LONGTEXT)
 */
export function nullableStringSchema(label: string, maxLength?: number) {
	const trimmedString = z
		.string({ message: `${label} should be a string` })
		.trim();

	const boundedString =
		maxLength === undefined
			? trimmedString
			: trimmedString.max(maxLength, {
					message: `${label} should contain at most ${maxLength} characters`,
				});

	return (
		boundedString
			// Une moitié d'emoji isolée (surrogate orphelin) serait remplacée par « � » en base, sans erreur
			.refine((value) => value.isWellFormed(), {
				message: `${label} should not contain invalid characters`,
				params: { code: ValidationIssueCodeEnum.INVALID_CHARACTERS },
			})
			.transform((value) => (value === "" ? null : value))
			.nullable()
	);
}
