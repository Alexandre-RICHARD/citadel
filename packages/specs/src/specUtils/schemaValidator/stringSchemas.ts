import { z } from "zod";

const REQUIRED_STRING_MIN_LENGTH = 1;

export function requiredStringSchema(label: string, maxLength: number) {
	return z
		.string({ message: `${label} should be a string` })
		.trim()
		.min(REQUIRED_STRING_MIN_LENGTH, {
			message: `${label} should contain at least ${REQUIRED_STRING_MIN_LENGTH} character`,
		})
		.max(maxLength, {
			message: `${label} should contain at most ${maxLength} characters`,
		});
}

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

	return boundedString
		.transform((value) => (value === "" ? null : value))
		.nullable();
}
