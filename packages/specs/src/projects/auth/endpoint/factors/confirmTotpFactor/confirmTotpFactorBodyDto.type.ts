import type { z } from "zod";

import type { confirmTotpFactorBodySchema } from "./confirmTotpFactorBodySchema.ts";

export type ConfirmTotpFactorBodyDto = z.infer<
	typeof confirmTotpFactorBodySchema
>;
