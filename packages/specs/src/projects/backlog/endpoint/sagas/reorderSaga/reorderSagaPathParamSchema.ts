import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const reorderSagaPathParamSchema = z.object({
	sagaId: pathParamIdSchema("Saga ID"),
});
