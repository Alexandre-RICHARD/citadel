import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { isStatusAllowed } from "../../../helper/status/isStatusAllowed.ts";
import { customizationSchema } from "../../../schema/customizationSchema.ts";
import { newUserVersionSchema } from "../../../schema/newUserVersionSchema.ts";

// Un statut de fin de la version jouée exige un type de fin
export const createUserGameBodySchema = z
	.object({
		gameId: bodyIdSchema("Game ID"),
		customization: customizationSchema,
		userVersion: newUserVersionSchema,
	})
	.refine(
		({ customization, userVersion }) =>
			isStatusAllowed(userVersion.status, customization.endingType),
		{
			message: "A finished status needs an ending type",
			path: ["userVersion", "status"],
			params: { code: ValidationIssueCodeEnum.INCOMPATIBLE_VALUE },
		},
	);
