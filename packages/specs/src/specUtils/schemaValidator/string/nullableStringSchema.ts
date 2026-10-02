import { z } from "zod";

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
