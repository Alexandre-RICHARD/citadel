import type { z } from "zod";

import type { getSagaEntriesPathParamSchema } from "./getSagaEntriesPathParamSchema.ts";

export type GetSagaEntriesPathParamDto = z.infer<
	typeof getSagaEntriesPathParamSchema
>;
