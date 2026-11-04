import type { z } from "zod";

import type { startEmailChangeBodySchema } from "./startEmailChangeBodySchema.ts";

export type StartEmailChangeBodyDto = z.infer<
	typeof startEmailChangeBodySchema
>;
