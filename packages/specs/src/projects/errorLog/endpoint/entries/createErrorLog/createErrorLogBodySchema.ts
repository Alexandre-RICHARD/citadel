import { z } from "zod";

import { nullableStringSchema } from "../../../../../specUtils/schemaValidator/string/nullableStringSchema.ts";
import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const createErrorLogBodySchema = z.object({
	errorType: requiredStringSchema(
		"Error type",
		SqlColumnMaxLengthEnum.VARCHAR_100,
	),
	message: requiredStringSchema("Message", SqlColumnMaxLengthEnum.TEXT),
	// TODO EXPLICITER Colonne LONGTEXT : pas de limite pratique
	stack: nullableStringSchema("Stack"),
});
