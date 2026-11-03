import type { z } from "zod";

import type { deleteFactorPathParamSchema } from "./deleteFactorPathParamSchema.ts";

export type DeleteFactorPathParamDto = z.infer<
	typeof deleteFactorPathParamSchema
>;
