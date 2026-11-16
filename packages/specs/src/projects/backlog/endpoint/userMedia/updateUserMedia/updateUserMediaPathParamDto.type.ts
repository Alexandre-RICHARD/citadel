import type { z } from "zod";

import type { updateUserMediaPathParamSchema } from "./updateUserMediaPathParamSchema.ts";

export type UpdateUserMediaPathParamDto = z.infer<
	typeof updateUserMediaPathParamSchema
>;
