import type { z } from "zod";

import type { startRegistrationBodySchema } from "./startRegistrationBodySchema.ts";

export type StartRegistrationBodyDto = z.infer<
	typeof startRegistrationBodySchema
>;
