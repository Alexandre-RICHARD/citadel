import type { z } from "zod";

import type { createBossPathParamSchema } from "./createBossPathParam.schema.ts";

export type CreateBossPathParamDto = z.infer<typeof createBossPathParamSchema>;
