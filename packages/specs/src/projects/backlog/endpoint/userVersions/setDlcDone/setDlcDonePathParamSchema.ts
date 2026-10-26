import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const setDlcDonePathParamSchema = z.object({
	id: pathParamIdSchema("ID"),
	dlcId: pathParamIdSchema("DLC ID"),
});
