import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const addDeathPathParamSchema = z.object({
	bossId: pathParamIdSchema("Boss ID"),
});
