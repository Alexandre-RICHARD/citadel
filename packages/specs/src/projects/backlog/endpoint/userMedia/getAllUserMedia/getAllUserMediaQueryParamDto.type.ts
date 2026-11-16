import type { z } from "zod";

import type { getAllUserMediaQueryParamSchema } from "./getAllUserMediaQueryParamSchema.ts";

export type GetAllUserMediaQueryParamDto = z.infer<
	typeof getAllUserMediaQueryParamSchema
>;
