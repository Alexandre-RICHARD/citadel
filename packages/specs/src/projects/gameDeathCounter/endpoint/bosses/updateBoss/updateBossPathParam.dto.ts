import type { z } from "zod";

import type { updateBossPathParamSchema } from "./updateBossPathParam.schema.ts";

export type UpdateBossPathParamDto = z.infer<typeof updateBossPathParamSchema>;
