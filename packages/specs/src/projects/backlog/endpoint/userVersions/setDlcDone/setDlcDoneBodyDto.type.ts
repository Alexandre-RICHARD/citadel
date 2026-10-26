import type { z } from "zod";

import type { setDlcDoneBodySchema } from "./setDlcDoneBodySchema.ts";

export type SetDlcDoneBodyDto = z.infer<typeof setDlcDoneBodySchema>;
