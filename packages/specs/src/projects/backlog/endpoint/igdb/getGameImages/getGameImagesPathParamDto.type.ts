import type { z } from "zod";

import type { getGameImagesPathParamSchema } from "./getGameImagesPathParamSchema.ts";

export type GetGameImagesPathParamDto = z.infer<
	typeof getGameImagesPathParamSchema
>;
