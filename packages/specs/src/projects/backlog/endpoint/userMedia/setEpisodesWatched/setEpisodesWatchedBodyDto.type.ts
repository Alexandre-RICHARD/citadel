import type { z } from "zod";

import type { setEpisodesWatchedBodySchema } from "./setEpisodesWatchedBodySchema.ts";

export type SetEpisodesWatchedBodyDto = z.infer<
	typeof setEpisodesWatchedBodySchema
>;
