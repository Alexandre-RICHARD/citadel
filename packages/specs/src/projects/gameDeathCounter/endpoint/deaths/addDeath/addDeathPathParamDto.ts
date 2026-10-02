import type { z } from "zod";

import type { addDeathPathParamSchema } from "./addDeathPathParamSchema.ts";

export type AddDeathPathParamDto = z.infer<typeof addDeathPathParamSchema>;
