import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";

export const setGameFinishedBodySchema = z.object({
	finished: booleanSchema("Finished"),
});
