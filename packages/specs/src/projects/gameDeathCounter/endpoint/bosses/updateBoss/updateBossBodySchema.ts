import { z } from "zod";

import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/idSchemas.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/sqlColumnMaxLength.enum.ts";
import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/stringSchemas.ts";

export const updateBossBodySchema = z.object({
	name: requiredStringSchema("Name", SqlColumnMaxLengthEnum.VARCHAR_255),
	gameId: bodyIdSchema("Game ID"),
});
