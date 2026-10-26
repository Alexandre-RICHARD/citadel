import type { z } from "zod";

import type { getSeriesEntriesPathParamSchema } from "./getSeriesEntriesPathParamSchema.ts";

export type GetSeriesEntriesPathParamDto = z.infer<
	typeof getSeriesEntriesPathParamSchema
>;
