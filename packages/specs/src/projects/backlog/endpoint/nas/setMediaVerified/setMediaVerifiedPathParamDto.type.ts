import type { z } from "zod";

import type { setMediaVerifiedPathParamSchema } from "./setMediaVerifiedPathParamSchema.ts";

export type SetMediaVerifiedPathParamDto = z.infer<
	typeof setMediaVerifiedPathParamSchema
>;
