import type { z } from "zod";

import type { setEpisodesWatchedPathParamSchema } from "./setEpisodesWatchedPathParamSchema.ts";

export type SetEpisodesWatchedPathParamDto = z.infer<
	typeof setEpisodesWatchedPathParamSchema
>;
