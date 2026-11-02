import type { z } from "zod";

import type { loginWithPasswordBodySchema } from "./loginWithPasswordBodySchema.ts";

export type LoginWithPasswordBodyDto = z.infer<
	typeof loginWithPasswordBodySchema
>;
