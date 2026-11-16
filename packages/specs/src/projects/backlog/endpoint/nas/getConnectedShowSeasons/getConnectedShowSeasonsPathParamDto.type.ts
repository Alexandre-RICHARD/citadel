import type { z } from "zod";

import type { getConnectedShowSeasonsPathParamSchema } from "./getConnectedShowSeasonsPathParamSchema.ts";

export type GetConnectedShowSeasonsPathParamDto = z.infer<
	typeof getConnectedShowSeasonsPathParamSchema
>;
