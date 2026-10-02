import type { z } from "zod";

import type { createGameBodySchema } from "./createGameBodySchema.ts";

export type CreateGameBodyDto = z.infer<typeof createGameBodySchema>;
