import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { episodeIdListSchema } from "../../../schema/episodeIdListSchema.ts";

export const setEpisodesWatchedBodySchema = z.object({
	episodeIds: episodeIdListSchema("Episode IDs"),
	isWatched: booleanSchema("Is watched"),
});
