import type { z } from "zod";

import type { nasGapSchema } from "./nasGapSchema.ts";

export type NasGap = z.infer<typeof nasGapSchema>;
