import type { z } from "zod";

import type { createBossBodySchema } from "./createBossBody.schema.ts";

export type CreateBossBodyDto = z.infer<typeof createBossBodySchema>;
