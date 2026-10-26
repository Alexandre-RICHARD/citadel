import type { z } from "zod";

import type { getGamePreviewPathParamSchema } from "./getGamePreviewPathParamSchema.ts";

export type GetGamePreviewPathParamDto = z.infer<
	typeof getGamePreviewPathParamSchema
>;
