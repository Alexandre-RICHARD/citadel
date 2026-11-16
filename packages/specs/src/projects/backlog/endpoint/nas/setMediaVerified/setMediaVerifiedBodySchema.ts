import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { episodeIdListSchema } from "../../../schema/episodeIdListSchema.ts";

// Un film : sans épisodes (null). Une série : ses épisodes cochés, cascade comprise, confirmée par le front
export const setMediaVerifiedBodySchema = z.object({
	episodeIds: episodeIdListSchema("Episode IDs").nullable(),
	isVerified: booleanSchema("Is verified"),
});
