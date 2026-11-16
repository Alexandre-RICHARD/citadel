import type { z } from "zod";

import type { arrQueueSchema } from "./arrQueueSchema.ts";

export type ArrQueue = z.infer<typeof arrQueueSchema>;
