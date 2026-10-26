import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const importGameContentPathParamSchema = z.object({
	gameId: pathParamIdSchema("Game ID"),
});
