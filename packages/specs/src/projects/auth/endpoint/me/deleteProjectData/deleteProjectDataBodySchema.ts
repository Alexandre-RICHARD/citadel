import { z } from "zod";

import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

export const deleteProjectDataBodySchema = z.object({
	password: typedPasswordSchema,
});
