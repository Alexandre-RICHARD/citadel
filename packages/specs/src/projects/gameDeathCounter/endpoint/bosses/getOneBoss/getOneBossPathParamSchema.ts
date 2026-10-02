import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const getOneBossPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
