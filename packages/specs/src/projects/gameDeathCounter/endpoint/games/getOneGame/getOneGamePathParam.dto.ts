import type { z } from "zod";

import type { getOneGamePathParamSchema } from "./getOneGamePathParam.schema.ts";

export type GetOneGamePathParamDto = z.infer<typeof getOneGamePathParamSchema>;
