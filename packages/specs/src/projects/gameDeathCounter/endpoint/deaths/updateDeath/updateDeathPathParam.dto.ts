import type { z } from "zod";

import type { updateDeathPathParamSchema } from "./updateDeathPathParam.schema.ts";

export type UpdateDeathPathParamDto = z.infer<
	typeof updateDeathPathParamSchema
>;
