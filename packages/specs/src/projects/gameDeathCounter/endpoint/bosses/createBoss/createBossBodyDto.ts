import type { z } from "zod";

import type { createBossBodySchema } from "./createBossBodySchema.ts";

export type CreateBossBodyDto = z.infer<typeof createBossBodySchema>;
