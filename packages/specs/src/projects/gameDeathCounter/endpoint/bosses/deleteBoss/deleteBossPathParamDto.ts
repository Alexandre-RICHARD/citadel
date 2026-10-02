import type { z } from "zod";

import type { deleteBossPathParamSchema } from "./deleteBossPathParamSchema.ts";

export type DeleteBossPathParamDto = z.infer<typeof deleteBossPathParamSchema>;
