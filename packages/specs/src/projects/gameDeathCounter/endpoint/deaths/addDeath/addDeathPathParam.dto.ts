import type { z } from "zod";

import type { addDeathPathParamSchema } from "./addDeathPathParam.schema.ts";

export type AddDeathPathParamDto = z.infer<typeof addDeathPathParamSchema>;
