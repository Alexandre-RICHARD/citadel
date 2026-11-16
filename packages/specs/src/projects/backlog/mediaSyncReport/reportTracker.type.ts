import type { z } from "zod";

import type { reportTrackerSchema } from "./reportTrackerSchema.ts";

export type ReportTracker = z.infer<typeof reportTrackerSchema>;
