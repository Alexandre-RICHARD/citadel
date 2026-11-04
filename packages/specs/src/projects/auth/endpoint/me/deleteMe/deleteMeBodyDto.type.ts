import type { z } from "zod";

import type { deleteMeBodySchema } from "./deleteMeBodySchema.ts";

export type DeleteMeBodyDto = z.infer<typeof deleteMeBodySchema>;
