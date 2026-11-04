import type { z } from "zod";

import type { updateMeBodySchema } from "./updateMeBodySchema.ts";

export type UpdateMeBodyDto = z.infer<typeof updateMeBodySchema>;
