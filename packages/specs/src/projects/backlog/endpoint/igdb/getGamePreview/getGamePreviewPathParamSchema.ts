import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getGamePreviewPathParamSchema = z.object({
	igdbId: pathParamIdSchema("IGDB ID"),
});
