import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { requireAtLeastOneField } from "../../../../../specUtils/schemaValidator/object/requireAtLeastOneField.ts";
import { nullableStringSchema } from "../../../../../specUtils/schemaValidator/string/nullableStringSchema.ts";
import { SqlColumnMaxLengthEnum } from "../../../../../specUtils/schemaValidator/string/sqlColumnMaxLength.enum.ts";

export const updateUserMediaBodySchema = requireAtLeastOneField(
	z
		.object({
			isWatched: booleanSchema("Is watched"),
			isUpNext: booleanSchema("Is up next"),
			isInProgress: booleanSchema("Is in progress"),
			comment: nullableStringSchema("Comment", SqlColumnMaxLengthEnum.TEXT),
		})
		.partial(),
);
