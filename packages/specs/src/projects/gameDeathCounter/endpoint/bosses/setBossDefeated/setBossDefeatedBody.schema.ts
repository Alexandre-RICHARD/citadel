import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/booleanSchemas.ts";

export const setBossDefeatedBodySchema = z.object({
	defeated: booleanSchema("Defeated"),
});
