import type { z } from "zod";

import type { changePasswordBodySchema } from "./changePasswordBodySchema.ts";

export type ChangePasswordBodyDto = z.infer<typeof changePasswordBodySchema>;
