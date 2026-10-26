import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const reorderSeriesPathParamSchema = z.object({
	seriesId: pathParamIdSchema("Series ID"),
});
