import { z } from "zod";

import { emailSchema } from "../../../schema/emailSchema.ts";
import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

export const startEmailChangeBodySchema = z.object({
	password: typedPasswordSchema,
	newEmail: emailSchema,
});
