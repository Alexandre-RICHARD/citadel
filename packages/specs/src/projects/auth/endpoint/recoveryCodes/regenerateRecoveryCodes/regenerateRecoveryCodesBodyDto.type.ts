import type { z } from "zod";

import type { regenerateRecoveryCodesBodySchema } from "./regenerateRecoveryCodesBodySchema.ts";

export type RegenerateRecoveryCodesBodyDto = z.infer<
	typeof regenerateRecoveryCodesBodySchema
>;
