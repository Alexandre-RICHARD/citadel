import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const updateUserMediaPathParamSchema = z.object({
	userMediaId: pathParamIdSchema("User media ID"),
});
