import { z } from "zod";

import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const updateBossBodySchema = z.object({
	name: requiredStringSchema("Name", SqlColumnMaxLengthEnum.VARCHAR_255),
	gameId: bodyIdSchema("Game ID"),
});
