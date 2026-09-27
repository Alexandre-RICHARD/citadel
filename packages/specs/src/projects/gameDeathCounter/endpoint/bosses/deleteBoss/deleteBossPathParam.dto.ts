import type { z } from "zod";

import type { deleteBossPathParamSchema } from "./deleteBossPathParam.schema.ts";

export type DeleteBossPathParamDto = z.infer<typeof deleteBossPathParamSchema>;
