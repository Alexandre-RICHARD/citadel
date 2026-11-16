import type { z } from "zod";

import type { nasEntrySchema } from "./nasEntrySchema.ts";

export type NasEntry = z.infer<typeof nasEntrySchema>;
