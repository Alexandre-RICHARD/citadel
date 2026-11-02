import { z } from "zod";

import { identifierSchema } from "../../../schema/identifierSchema.ts";

export const startPasswordResetBodySchema = z.object({
	identifier: identifierSchema,
});
