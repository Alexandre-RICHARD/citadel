import { z } from "zod";

import { typedPasswordSchema } from "../../../../auth/schema/typedPasswordSchema.ts";

export const unlockNasBodySchema = z.object({
	password: typedPasswordSchema,
});
