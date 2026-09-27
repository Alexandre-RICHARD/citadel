import type { z } from "zod";

import type { createErrorLogBodySchema } from "./createErrorLogBody.schema.ts";

export type CreateErrorLogBodyDto = z.infer<typeof createErrorLogBodySchema>;
