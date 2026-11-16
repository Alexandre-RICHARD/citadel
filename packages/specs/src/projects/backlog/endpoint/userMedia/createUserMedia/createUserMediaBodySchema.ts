import { z } from "zod";

import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { mediaCustomizationSchema } from "../../../schema/mediaCustomizationSchema.ts";
import { mediaTypeSchema } from "../../../schema/mediaTypeSchema.ts";

export const createUserMediaBodySchema = z.object({
	mediaType: mediaTypeSchema,
	tmdbId: bodyIdSchema("TMDB ID"),
	customization: mediaCustomizationSchema,
});
