import type { z } from "zod";

import type { updateDeathBodySchema } from "./updateDeathBodySchema.ts";

export type UpdateDeathBodyDto = z.infer<typeof updateDeathBodySchema>;
