import { z } from "zod";

import { bodyIdListSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdListSchema.ts";

export const applyShowUpdatesBodySchema = z.object({
	tmdbIds: bodyIdListSchema("TMDB IDs").min(1, {
		message: "TMDB IDs should contain at least one id",
	}),
});
