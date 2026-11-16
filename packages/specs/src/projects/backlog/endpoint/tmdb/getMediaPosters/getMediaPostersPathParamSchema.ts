import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";
import { mediaTypeSchema } from "../../../schema/mediaTypeSchema.ts";

export const getMediaPostersPathParamSchema = z.object({
	mediaType: mediaTypeSchema,
	tmdbId: pathParamIdSchema("TMDB ID"),
});
