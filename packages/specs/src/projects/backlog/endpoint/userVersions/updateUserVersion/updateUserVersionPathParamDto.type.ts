import type { z } from "zod";

import type { updateUserVersionPathParamSchema } from "./updateUserVersionPathParamSchema.ts";

export type UpdateUserVersionPathParamDto = z.infer<
	typeof updateUserVersionPathParamSchema
>;
