import type { z } from "zod";

import type { deleteGamePathParamSchema } from "./deleteGamePathParam.schema.ts";

export type DeleteGamePathParamDto = z.infer<typeof deleteGamePathParamSchema>;
