import type { z } from "zod";

import type { updateGameBodySchema } from "./updateGameBody.schema.ts";

export type UpdateGameBodyDto = z.infer<typeof updateGameBodySchema>;
