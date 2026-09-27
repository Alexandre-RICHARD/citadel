import type { z } from "zod";

import type { deleteDeathPathParamSchema } from "./deleteDeathPathParam.schema.ts";

export type DeleteDeathPathParamDto = z.infer<
	typeof deleteDeathPathParamSchema
>;
