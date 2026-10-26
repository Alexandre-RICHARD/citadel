import { z } from "zod";

import { pathParamIdSchema } from "../../../../../specUtils/schemaValidator/id/pathParamIdSchema.ts";

export const getSeriesEntriesPathParamSchema = z.object({
	seriesId: pathParamIdSchema("Series ID"),
});
