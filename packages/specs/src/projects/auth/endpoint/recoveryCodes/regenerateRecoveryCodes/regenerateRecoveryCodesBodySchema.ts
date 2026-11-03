import { z } from "zod";

import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

export const regenerateRecoveryCodesBodySchema = z.object({
	password: typedPasswordSchema,
});
