import type { z } from "zod";

import type { updateGamePathParamSchema } from "./updateGamePathParam.schema.ts";

export type UpdateGamePathParamDto = z.infer<typeof updateGamePathParamSchema>;
