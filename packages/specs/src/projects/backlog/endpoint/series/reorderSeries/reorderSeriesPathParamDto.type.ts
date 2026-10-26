import type { z } from "zod";

import type { reorderSeriesPathParamSchema } from "./reorderSeriesPathParamSchema.ts";

export type ReorderSeriesPathParamDto = z.infer<
	typeof reorderSeriesPathParamSchema
>;
