import { z } from "zod";

import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const createBossBodySchema = z.object({
	name: requiredStringSchema("Name", SqlColumnMaxLengthEnum.VARCHAR_255),
});
