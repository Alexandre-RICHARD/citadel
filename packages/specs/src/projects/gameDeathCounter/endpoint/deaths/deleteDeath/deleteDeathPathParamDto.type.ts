import type { z } from "zod";

import type { deleteDeathPathParamSchema } from "./deleteDeathPathParamSchema.ts";

export type DeleteDeathPathParamDto = z.infer<
	typeof deleteDeathPathParamSchema
>;
