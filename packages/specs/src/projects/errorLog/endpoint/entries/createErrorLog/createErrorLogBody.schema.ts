import { z } from "zod";

import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/sqlColumnMaxLength.enum.ts";
import {
	nullableStringSchema,
	requiredStringSchema,
} from "../../../../../specUtils/schemaValidator/stringSchemas.ts";

export const createErrorLogBodySchema = z.object({
	errorType: requiredStringSchema(
		"Error type",
		SqlColumnMaxLengthEnum.VARCHAR_100,
	),
	message: requiredStringSchema("Message", SqlColumnMaxLengthEnum.TEXT),
	// Colonne LONGTEXT : pas de limite pratique
	stack: nullableStringSchema("Stack"),
});
