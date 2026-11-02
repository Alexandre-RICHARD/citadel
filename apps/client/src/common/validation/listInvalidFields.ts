import type { z } from "zod";

/**
 * Les champs d'un formulaire que le schéma refuse, pour les colorier à l'envoi. checkInput, lui, ne donne que la
 * phrase de la première règle enfreinte
 */
export function listInvalidFields<Schema extends z.ZodType>(
	schema: Schema,
	input: z.input<Schema>,
): ReadonlySet<string> {
	const result = schema.safeParse(input);
	if (result.success) return new Set();
	return new Set(
		result.error.issues.flatMap(({ path: [field] }) =>
			typeof field === "string" ? [field] : [],
		),
	);
}
