import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const getOneGamePathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
