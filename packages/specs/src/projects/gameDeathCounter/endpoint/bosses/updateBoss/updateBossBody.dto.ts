import type { z } from "zod";

import type { updateBossBodySchema } from "./updateBossBody.schema.ts";

export type UpdateBossBodyDto = z.infer<typeof updateBossBodySchema>;
