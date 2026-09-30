import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const updateDeathPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
