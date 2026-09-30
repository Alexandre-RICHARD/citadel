import { type z } from "zod";

// Mise à jour partielle : tous les champs sont optionnels, mais au moins un doit être renseigné
export function requireAtLeastOneField<Shape extends z.ZodRawShape>(
	objectSchema: z.ZodObject<Shape>,
) {
	const fieldNames = Object.keys(objectSchema.shape);

	return objectSchema.refine(
		(object) =>
			fieldNames.some(
				(fieldName) =>
					(object as Record<string, unknown>)[fieldName] !== undefined,
			),
		{ message: `At least one of ${fieldNames.join(", ")} should be provided` },
	);
}
