import type { z } from "zod";

import type { updateDeathBodySchema } from "./updateDeathBody.schema.ts";

export type UpdateDeathBodyDto = z.infer<typeof updateDeathBodySchema>;
