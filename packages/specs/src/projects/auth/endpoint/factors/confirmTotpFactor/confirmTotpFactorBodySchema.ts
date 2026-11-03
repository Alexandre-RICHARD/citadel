import { z } from "zod";

import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { totpCodeSchema } from "../../../schema/totpCodeSchema.ts";

export const confirmTotpFactorBodySchema = z.object({
	factorId: bodyIdSchema("Factor ID"),
	code: totpCodeSchema,
});
