import type { z } from "zod";

import type { importGameContentBodySchema } from "./importGameContentBodySchema.ts";

export type ImportGameContentBodyDto = z.infer<
	typeof importGameContentBodySchema
>;
