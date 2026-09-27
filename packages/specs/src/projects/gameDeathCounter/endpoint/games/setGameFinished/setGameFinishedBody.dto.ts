import type { z } from "zod";

import type { setGameFinishedBodySchema } from "./setGameFinishedBody.schema.ts";

export type SetGameFinishedBodyDto = z.infer<typeof setGameFinishedBodySchema>;
