import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const updateBossPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
