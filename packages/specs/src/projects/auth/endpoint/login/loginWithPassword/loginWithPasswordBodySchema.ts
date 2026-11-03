import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { identifierSchema } from "../../../schema/identifierSchema.ts";
import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

export const loginWithPasswordBodySchema = z.object({
	identifier: identifierSchema,
	password: typedPasswordSchema,
	remember: booleanSchema("Remember"),
});
