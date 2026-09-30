import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const deleteGamePathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
