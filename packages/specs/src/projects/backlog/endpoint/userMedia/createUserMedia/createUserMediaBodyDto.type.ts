import type { z } from "zod";

import type { createUserMediaBodySchema } from "./createUserMediaBodySchema.ts";

export type CreateUserMediaBodyDto = z.infer<typeof createUserMediaBodySchema>;
