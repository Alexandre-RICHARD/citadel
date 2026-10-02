import type { z } from "zod";

import type { getOneBossPathParamSchema } from "./getOneBossPathParamSchema.ts";

export type GetOneBossPathParamDto = z.infer<typeof getOneBossPathParamSchema>;
