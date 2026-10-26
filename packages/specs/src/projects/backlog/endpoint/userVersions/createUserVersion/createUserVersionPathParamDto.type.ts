import type { z } from "zod";

import type { createUserVersionPathParamSchema } from "./createUserVersionPathParamSchema.ts";

export type CreateUserVersionPathParamDto = z.infer<
	typeof createUserVersionPathParamSchema
>;
