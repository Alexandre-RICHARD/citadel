import { z } from "zod";

import { pastIsoDateTimeSchema } from "../../../../../specUtils/schemaValidator/date/pastIsoDateTimeSchema.ts";
import { requireAtLeastOneField } from "../../../../../specUtils/schemaValidator/object/requireAtLeastOneField.ts";
import { nullableStringSchema } from "../../../../../specUtils/schemaValidator/string/nullableStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const updateDeathBodySchema = requireAtLeastOneField(
	z.object({
		date: pastIsoDateTimeSchema("Date").optional(),
		comment: nullableStringSchema(
			"Comment",
			SqlColumnMaxLengthEnum.VARCHAR_1000,
		).optional(),
	}),
);
