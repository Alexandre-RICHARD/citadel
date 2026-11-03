import type { z } from "zod";

import type { createTotpFactorBodySchema } from "./createTotpFactorBodySchema.ts";

export type CreateTotpFactorBodyDto = z.infer<
	typeof createTotpFactorBodySchema
>;
