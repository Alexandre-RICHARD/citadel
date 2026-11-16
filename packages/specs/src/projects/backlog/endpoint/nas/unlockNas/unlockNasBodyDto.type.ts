import type { z } from "zod";

import type { unlockNasBodySchema } from "./unlockNasBodySchema.ts";

export type UnlockNasBodyDto = z.infer<typeof unlockNasBodySchema>;
