import { z } from "zod";

import { sagaChoiceSchema } from "./sagaChoiceSchema.ts";
import { seriesNumberSchema } from "./seriesNumberSchema.ts";
import { tmdbImagePathSchema } from "./tmdbImagePathSchema.ts";

/**
 * Personnalisation d'un média du backlog, à l'ajout ou par « Personnaliser » : miniature, saga et numéro. Le numéro suit
 * les règles des séries des jeux ; il est ignoré sans saga, et une saga sans numéro place le média après les autres
 */
export const mediaCustomizationSchema = z.object({
	imagePath: tmdbImagePathSchema("Image path").nullable(),
	saga: sagaChoiceSchema,
	sagaNumber: seriesNumberSchema("Saga number").nullable(),
});
