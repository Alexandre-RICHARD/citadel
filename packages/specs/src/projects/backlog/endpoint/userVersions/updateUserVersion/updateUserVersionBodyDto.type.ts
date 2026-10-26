import type { z } from "zod";

import type { updateUserVersionBodySchema } from "./updateUserVersionBodySchema.ts";

export type UpdateUserVersionBodyDto = z.infer<
	typeof updateUserVersionBodySchema
>;
