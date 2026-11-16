import type { z } from "zod";

import type { reorderSagaBodySchema } from "./reorderSagaBodySchema.ts";

export type ReorderSagaBodyDto = z.infer<typeof reorderSagaBodySchema>;
