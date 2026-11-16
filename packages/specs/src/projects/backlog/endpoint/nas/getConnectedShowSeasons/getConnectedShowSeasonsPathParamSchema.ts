import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getConnectedShowSeasonsPathParamSchema = z.object({
	userMediaId: pathParamIdSchema("User media ID"),
});
