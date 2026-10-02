import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const deleteBossPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
