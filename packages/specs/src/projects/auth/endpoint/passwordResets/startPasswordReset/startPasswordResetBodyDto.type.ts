import type { z } from "zod";

import type { startPasswordResetBodySchema } from "./startPasswordResetBodySchema.ts";

export type StartPasswordResetBodyDto = z.infer<
	typeof startPasswordResetBodySchema
>;
