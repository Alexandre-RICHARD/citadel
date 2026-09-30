import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const updateGamePathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
