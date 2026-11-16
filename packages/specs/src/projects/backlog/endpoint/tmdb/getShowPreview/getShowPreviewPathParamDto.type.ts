import type { z } from "zod";

import type { getShowPreviewPathParamSchema } from "./getShowPreviewPathParamSchema.ts";

export type GetShowPreviewPathParamDto = z.infer<
	typeof getShowPreviewPathParamSchema
>;
