import type { z } from "zod";

import type { searchTmdbMediaQueryParamSchema } from "./searchTmdbMediaQueryParamSchema.ts";

export type SearchTmdbMediaQueryParamDto = z.infer<
	typeof searchTmdbMediaQueryParamSchema
>;
