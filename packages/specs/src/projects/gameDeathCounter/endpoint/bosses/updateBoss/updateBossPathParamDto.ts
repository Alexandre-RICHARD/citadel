import type { z } from "zod";

import type { updateBossPathParamSchema } from "./updateBossPathParamSchema.ts";

export type UpdateBossPathParamDto = z.infer<typeof updateBossPathParamSchema>;
