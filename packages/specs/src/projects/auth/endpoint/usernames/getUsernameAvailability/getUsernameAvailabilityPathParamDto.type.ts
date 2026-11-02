import type { z } from "zod";

import type { getUsernameAvailabilityPathParamSchema } from "./getUsernameAvailabilityPathParamSchema.ts";

export type GetUsernameAvailabilityPathParamDto = z.infer<
	typeof getUsernameAvailabilityPathParamSchema
>;
