import type { z } from "zod";

import type { getOneBossPathParamSchema } from "./getOneBossPathParam.schema.ts";

export type GetOneBossPathParamDto = z.infer<typeof getOneBossPathParamSchema>;
