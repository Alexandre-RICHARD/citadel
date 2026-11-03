import { z } from "zod";

import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

export const deleteFactorBodySchema = z.object({
	password: typedPasswordSchema,
});
