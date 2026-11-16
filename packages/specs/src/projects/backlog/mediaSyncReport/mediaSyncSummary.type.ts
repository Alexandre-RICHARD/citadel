import type { z } from "zod";

import type { mediaSyncSummarySchema } from "./mediaSyncSummarySchema.ts";

export type MediaSyncSummary = z.infer<typeof mediaSyncSummarySchema>;
