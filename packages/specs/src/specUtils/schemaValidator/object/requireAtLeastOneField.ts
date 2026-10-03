import { type z } from "zod";

import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";

export function requireAtLeastOneField<Shape extends z.ZodRawShape>(
	objectSchema: z.ZodObject<Shape>,
) {
	const fieldNames = Object.keys(objectSchema.shape);

	return objectSchema.refine(
		(object) =>
			fieldNames.some(
				(fieldName) =>
					(object as Record<string, unknown>)[fieldName] !== undefined,
			),
		{
			message: `At least one of ${fieldNames.join(", ")} should be provided`,
			params: { code: ValidationIssueCodeEnum.MISSING_FIELDS },
		},
	);
}
