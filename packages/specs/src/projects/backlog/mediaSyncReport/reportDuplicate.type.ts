import type { z } from "zod";

import type { reportDuplicateSchema } from "./reportDuplicateSchema.ts";

export type ReportDuplicate = z.infer<typeof reportDuplicateSchema>;
