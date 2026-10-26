import type { z } from "zod";

import type { createUserGameBodySchema } from "./createUserGameBodySchema.ts";

export type CreateUserGameBodyDto = z.infer<typeof createUserGameBodySchema>;
