import type { z } from "zod";

import type { arrMediaInfoSchema } from "./arrMediaInfoSchema.ts";

export type ArrMediaInfo = z.infer<typeof arrMediaInfoSchema>;
