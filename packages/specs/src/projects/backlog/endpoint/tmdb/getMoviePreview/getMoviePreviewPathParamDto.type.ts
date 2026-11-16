import type { z } from "zod";

import type { getMoviePreviewPathParamSchema } from "./getMoviePreviewPathParamSchema.ts";

export type GetMoviePreviewPathParamDto = z.infer<
	typeof getMoviePreviewPathParamSchema
>;
