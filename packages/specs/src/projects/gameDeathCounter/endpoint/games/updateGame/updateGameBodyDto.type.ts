import type { z } from "zod";

import type { updateGameBodySchema } from "./updateGameBodySchema.ts";

export type UpdateGameBodyDto = z.infer<typeof updateGameBodySchema>;
