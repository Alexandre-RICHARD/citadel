import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";

export const setBossDefeatedPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
