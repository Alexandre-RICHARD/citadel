import type z from "zod";

import type { createGameBodySchema } from "./createGameBody.schema.ts";

export type CreateGameBodyDto = z.infer<typeof createGameBodySchema>;
