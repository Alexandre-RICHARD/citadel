import type { z } from "zod";

import type { reorderSeriesBodySchema } from "./reorderSeriesBodySchema.ts";

export type ReorderSeriesBodyDto = z.infer<typeof reorderSeriesBodySchema>;
