import type { z } from "zod";

import type { createErrorLogBodySchema } from "./createErrorLogBodySchema.ts";

export type CreateErrorLogBodyDto = z.infer<typeof createErrorLogBodySchema>;
