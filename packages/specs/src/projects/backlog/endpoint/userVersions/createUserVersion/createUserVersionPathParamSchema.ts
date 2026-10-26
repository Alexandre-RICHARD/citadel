import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const createUserVersionPathParamSchema = z.object({
	gameId: pathParamIdSchema("Game ID"),
});
