import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const deleteFactorPathParamSchema = z.object({
	factorId: pathParamIdSchema("Factor ID"),
});
