import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const setMediaVerifiedPathParamSchema = z.object({
	userMediaId: pathParamIdSchema("User media ID"),
});
