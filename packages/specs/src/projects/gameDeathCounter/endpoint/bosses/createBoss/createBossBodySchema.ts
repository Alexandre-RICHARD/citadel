import { z } from "zod";

import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/sqlColumnMaxLength.enum.ts";
import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/stringSchemas.ts";

export const createBossBodySchema = z.object({
	name: requiredStringSchema("Name", SqlColumnMaxLengthEnum.VARCHAR_255),
});
