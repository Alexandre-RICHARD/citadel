import type { z } from "zod";

import type { reorderSagaPathParamSchema } from "./reorderSagaPathParamSchema.ts";

export type ReorderSagaPathParamDto = z.infer<
	typeof reorderSagaPathParamSchema
>;
