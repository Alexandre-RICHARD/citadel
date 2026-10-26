import { z } from "zod";

import { endingTypeSchema } from "./endingTypeSchema.ts";
import { igdbImageIdSchema } from "./igdbImageIdSchema.ts";
import { seriesChoiceSchema } from "./seriesChoiceSchema.ts";
import { seriesNumberSchema } from "./seriesNumberSchema.ts";

/**
 * Personnalisation d'un jeu du backlog, à l'ajout au backlog ou par « Personnaliser ».
 * `seriesNumber` est ignoré sans série ; avec une série et sans numéro, le jeu passe après les autres
 */
export const customizationSchema = z.object({
	imageId: igdbImageIdSchema("Image ID").nullable(),
	endingType: endingTypeSchema,
	series: seriesChoiceSchema,
	seriesNumber: seriesNumberSchema("Series number").nullable(),
});
