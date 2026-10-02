import type { z } from "zod";

import type { setGameFinishedBodySchema } from "./setGameFinishedBodySchema.ts";

export type SetGameFinishedBodyDto = z.infer<typeof setGameFinishedBodySchema>;
