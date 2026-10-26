import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getGameImagesPathParamSchema = z.object({
	igdbId: pathParamIdSchema("IGDB ID"),
});
