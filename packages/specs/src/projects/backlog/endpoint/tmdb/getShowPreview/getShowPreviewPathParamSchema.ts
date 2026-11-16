import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getShowPreviewPathParamSchema = z.object({
	tmdbId: pathParamIdSchema("TMDB ID"),
});
