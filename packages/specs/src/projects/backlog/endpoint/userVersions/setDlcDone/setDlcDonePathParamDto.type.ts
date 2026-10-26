import type { z } from "zod";

import type { setDlcDonePathParamSchema } from "./setDlcDonePathParamSchema.ts";

export type SetDlcDonePathParamDto = z.infer<typeof setDlcDonePathParamSchema>;
