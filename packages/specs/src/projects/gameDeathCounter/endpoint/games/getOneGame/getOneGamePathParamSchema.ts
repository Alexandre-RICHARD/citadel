import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getOneGamePathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
