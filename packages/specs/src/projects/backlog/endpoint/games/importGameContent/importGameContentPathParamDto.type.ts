import type { z } from "zod";

import type { importGameContentPathParamSchema } from "./importGameContentPathParamSchema.ts";

export type ImportGameContentPathParamDto = z.infer<
	typeof importGameContentPathParamSchema
>;
