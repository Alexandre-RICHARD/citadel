import type { z } from "zod";

import type { nasFileSchema } from "./nasFileSchema.ts";

export type NasFile = z.infer<typeof nasFileSchema>;
