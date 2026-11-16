import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getSagaEntriesPathParamSchema = z.object({
	sagaId: pathParamIdSchema("Saga ID"),
});
