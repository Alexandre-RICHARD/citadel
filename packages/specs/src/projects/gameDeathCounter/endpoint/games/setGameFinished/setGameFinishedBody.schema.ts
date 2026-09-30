import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/booleanSchemas.ts";

export const setGameFinishedBodySchema = z.object({
	finished: booleanSchema("Finished"),
});
