import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const deleteUserGamePathParamSchema = z.object({
	gameId: pathParamIdSchema("Game ID"),
});
