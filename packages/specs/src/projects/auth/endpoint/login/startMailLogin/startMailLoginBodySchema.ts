import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { identifierSchema } from "../../../schema/identifierSchema.ts";

export const startMailLoginBodySchema = z.object({
	identifier: identifierSchema,
	remember: booleanSchema("Remember"),
});
