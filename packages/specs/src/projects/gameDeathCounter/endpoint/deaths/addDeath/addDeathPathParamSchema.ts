import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const addDeathPathParamSchema = z.object({
	bossId: pathParamIdSchema("Boss ID"),
});
