import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const createBossPathParamSchema = z.object({
	gameId: pathParamIdSchema("Game ID"),
});
