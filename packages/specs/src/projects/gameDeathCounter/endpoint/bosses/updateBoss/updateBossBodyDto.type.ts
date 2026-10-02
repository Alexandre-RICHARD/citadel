import type { z } from "zod";

import type { updateBossBodySchema } from "./updateBossBodySchema.ts";

export type UpdateBossBodyDto = z.infer<typeof updateBossBodySchema>;
