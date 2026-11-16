import type { z } from "zod";

import type { mediaSyncReportSchema } from "./mediaSyncReportSchema.ts";

export type MediaSyncReport = z.infer<typeof mediaSyncReportSchema>;
