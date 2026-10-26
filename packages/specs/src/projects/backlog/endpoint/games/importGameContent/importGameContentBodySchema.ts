import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdListSchema } from "../../../../../specUtils/schemaValidator/id/bodyIdListSchema.ts";

export const importGameContentBodySchema = z
	.object({
		versionIds: bodyIdListSchema("Version IDs"),
		dlcIds: bodyIdListSchema("DLC IDs"),
	})
	.refine(({ versionIds, dlcIds }) => versionIds.length + dlcIds.length > 0, {
		message: "At least one version or DLC should be given",
		params: { code: ValidationIssueCodeEnum.MISSING_FIELDS },
	});
