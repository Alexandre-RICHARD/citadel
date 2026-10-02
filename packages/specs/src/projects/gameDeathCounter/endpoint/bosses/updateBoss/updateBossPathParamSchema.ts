import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const updateBossPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
