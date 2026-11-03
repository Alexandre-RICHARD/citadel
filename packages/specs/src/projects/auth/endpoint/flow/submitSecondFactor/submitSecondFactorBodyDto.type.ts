import type { z } from "zod";

import type { submitSecondFactorBodySchema } from "./submitSecondFactorBodySchema.ts";

export type SubmitSecondFactorBodyDto = z.infer<
	typeof submitSecondFactorBodySchema
>;
