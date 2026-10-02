import type { z } from "zod";

import type { createBossPathParamSchema } from "./createBossPathParamSchema.ts";

export type CreateBossPathParamDto = z.infer<typeof createBossPathParamSchema>;
