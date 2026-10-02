import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const deleteDeathPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
