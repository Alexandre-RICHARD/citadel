import type { z } from "zod";

import type { deleteGamePathParamSchema } from "./deleteGamePathParamSchema.ts";

export type DeleteGamePathParamDto = z.infer<typeof deleteGamePathParamSchema>;
