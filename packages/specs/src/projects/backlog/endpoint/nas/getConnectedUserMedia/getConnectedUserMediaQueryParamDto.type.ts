import type { z } from "zod";

import type { getConnectedUserMediaQueryParamSchema } from "./getConnectedUserMediaQueryParamSchema.ts";

export type GetConnectedUserMediaQueryParamDto = z.infer<
	typeof getConnectedUserMediaQueryParamSchema
>;
