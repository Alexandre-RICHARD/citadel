import { z } from "zod";

import { factorNameSchema } from "../../../schema/factorNameSchema.ts";

export const createTotpFactorBodySchema = z.object({
	name: factorNameSchema,
});
