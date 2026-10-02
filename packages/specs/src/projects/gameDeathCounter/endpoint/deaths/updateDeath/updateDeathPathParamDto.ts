import type { z } from "zod";

import type { updateDeathPathParamSchema } from "./updateDeathPathParamSchema.ts";

export type UpdateDeathPathParamDto = z.infer<
	typeof updateDeathPathParamSchema
>;
