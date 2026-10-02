import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const createBossPathParamSchema = z.object({
	gameId: pathParamIdSchema("Game ID"),
});
