import type { z } from "zod";

import type { deleteFactorBodySchema } from "./deleteFactorBodySchema.ts";

export type DeleteFactorBodyDto = z.infer<typeof deleteFactorBodySchema>;
