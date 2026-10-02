import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const setBossDefeatedPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
