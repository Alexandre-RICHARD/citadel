import type { z } from "zod";

import type { customizeUserMediaBodySchema } from "./customizeUserMediaBodySchema.ts";

export type CustomizeUserMediaBodyDto = z.infer<
	typeof customizeUserMediaBodySchema
>;
