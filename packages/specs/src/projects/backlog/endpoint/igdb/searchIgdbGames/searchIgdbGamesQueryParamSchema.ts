import { z } from "zod";

import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const searchIgdbGamesQueryParamSchema = z.object({
	query: requiredStringSchema("Query", SqlColumnMaxLengthEnum.VARCHAR_255),
});
