import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";

export const setBossDefeatedBodySchema = z.object({
	defeated: booleanSchema("Defeated"),
});
