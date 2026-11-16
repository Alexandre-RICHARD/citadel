import type { z } from "zod";

import type { updateUserMediaBodySchema } from "./updateUserMediaBodySchema.ts";

export type UpdateUserMediaBodyDto = z.infer<typeof updateUserMediaBodySchema>;
