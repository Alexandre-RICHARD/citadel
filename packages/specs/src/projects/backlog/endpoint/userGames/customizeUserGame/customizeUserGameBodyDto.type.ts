import type { z } from "zod";

import type { customizeUserGameBodySchema } from "./customizeUserGameBodySchema.ts";

export type CustomizeUserGameBodyDto = z.infer<
	typeof customizeUserGameBodySchema
>;
