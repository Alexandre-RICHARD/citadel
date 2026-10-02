import type { z } from "zod";

import type { updateGamePathParamSchema } from "./updateGamePathParamSchema.ts";

export type UpdateGamePathParamDto = z.infer<typeof updateGamePathParamSchema>;
