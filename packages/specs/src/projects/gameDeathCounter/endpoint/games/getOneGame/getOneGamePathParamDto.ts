import type { z } from "zod";

import type { getOneGamePathParamSchema } from "./getOneGamePathParamSchema.ts";

export type GetOneGamePathParamDto = z.infer<typeof getOneGamePathParamSchema>;
