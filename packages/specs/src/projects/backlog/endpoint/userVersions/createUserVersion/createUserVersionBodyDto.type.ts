import type { z } from "zod";

import type { createUserVersionBodySchema } from "./createUserVersionBodySchema.ts";

export type CreateUserVersionBodyDto = z.infer<
	typeof createUserVersionBodySchema
>;
