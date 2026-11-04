import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const deleteSessionPathParamSchema = z.object({
	sessionId: pathParamIdSchema("Session ID"),
});
