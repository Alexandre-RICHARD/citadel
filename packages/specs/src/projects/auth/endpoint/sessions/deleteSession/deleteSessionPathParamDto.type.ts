import type { z } from "zod";

import type { deleteSessionPathParamSchema } from "./deleteSessionPathParamSchema.ts";

export type DeleteSessionPathParamDto = z.infer<
	typeof deleteSessionPathParamSchema
>;
