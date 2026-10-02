import { z } from "zod";

import { pastIsoDateTimeSchema } from "../../../../../specUtils/schemaValidator/dateSchemas.ts";
import { requireAtLeastOneField } from "../../../../../specUtils/schemaValidator/objectSchemas.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/sqlColumnMaxLength.enum.ts";
import { nullableStringSchema } from "../../../../../specUtils/schemaValidator/stringSchemas.ts";

export const updateDeathBodySchema = requireAtLeastOneField(
	z.object({
		date: pastIsoDateTimeSchema("Date").optional(),
		comment: nullableStringSchema(
			"Comment",
			SqlColumnMaxLengthEnum.VARCHAR_1000,
		).optional(),
	}),
);
