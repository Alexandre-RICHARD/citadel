import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const setGameFinishedPathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
});
