import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdSchema.ts";
import { isStatusAllowed } from "../../../rule/status/isStatusAllowed.ts";
import { customizationSchema } from "../../../schema/customizationSchema.ts";
import { newUserVersionSchema } from "../../../schema/newUserVersionSchema.ts";

// Le statut de la version jouée doit être proposé par le type de fin choisi
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
			message: "Status should be offered by the ending type",
			path: ["userVersion", "status"],
			params: { code: ValidationIssueCodeEnum.INCOMPATIBLE_VALUE },
		},
	);
