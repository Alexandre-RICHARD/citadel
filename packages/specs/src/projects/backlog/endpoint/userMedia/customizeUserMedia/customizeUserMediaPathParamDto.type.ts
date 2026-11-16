import type { z } from "zod";

import type { customizeUserMediaPathParamSchema } from "./customizeUserMediaPathParamSchema.ts";

export type CustomizeUserMediaPathParamDto = z.infer<
	typeof customizeUserMediaPathParamSchema
>;
