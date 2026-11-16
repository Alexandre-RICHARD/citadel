import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const customizeUserMediaPathParamSchema = z.object({
	userMediaId: pathParamIdSchema("User media ID"),
});
