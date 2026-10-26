import type { z } from "zod";

import type { customizeUserGamePathParamSchema } from "./customizeUserGamePathParamSchema.ts";

export type CustomizeUserGamePathParamDto = z.infer<
	typeof customizeUserGamePathParamSchema
>;
