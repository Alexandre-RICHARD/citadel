import type { z } from "zod";

import type { getShowSeasonsPathParamSchema } from "./getShowSeasonsPathParamSchema.ts";

export type GetShowSeasonsPathParamDto = z.infer<
	typeof getShowSeasonsPathParamSchema
>;
