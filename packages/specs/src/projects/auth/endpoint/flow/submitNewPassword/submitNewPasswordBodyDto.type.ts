import type { z } from "zod";

import type { submitNewPasswordBodySchema } from "./submitNewPasswordBodySchema.ts";

export type SubmitNewPasswordBodyDto = z.infer<
	typeof submitNewPasswordBodySchema
>;
