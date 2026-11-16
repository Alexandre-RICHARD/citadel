import type { z } from "zod";

import type { getMediaPostersPathParamSchema } from "./getMediaPostersPathParamSchema.ts";

export type GetMediaPostersPathParamDto = z.infer<
	typeof getMediaPostersPathParamSchema
>;
