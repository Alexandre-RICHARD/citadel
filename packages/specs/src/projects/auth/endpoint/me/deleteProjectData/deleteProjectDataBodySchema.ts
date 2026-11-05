import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { UserDataProjectEnum } from "../../../enum/userDataProject.enum.ts";
import { typedPasswordSchema } from "../../../schema/typedPasswordSchema.ts";

// Les projets vidés en une fois : un seul mot de passe vérifié, une seule transaction, tout ou rien
export const deleteProjectDataBodySchema = z.object({
	projects: z
		.array(z.enum(UserDataProjectEnum, { message: "Project is not valid" }), {
			message: "Projects should be an array",
		})
		.min(1, { message: "Projects should contain at least 1 project" })
		.refine((projects) => new Set(projects).size === projects.length, {
			message: "Projects should not contain the same project twice",
			params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
		}),
	password: typedPasswordSchema,
});
