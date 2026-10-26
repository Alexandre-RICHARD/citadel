import type { z } from "zod";

import type { getStoredGamePathParamSchema } from "./getStoredGamePathParamSchema.ts";

export type GetStoredGamePathParamDto = z.infer<
	typeof getStoredGamePathParamSchema
>;
