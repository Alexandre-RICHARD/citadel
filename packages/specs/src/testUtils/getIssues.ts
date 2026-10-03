import type { z } from "zod";

import { fromZodIssueToValidationIssueDto } from "../specUtils/error/fromZodIssueToValidationIssueDto.ts";
import type { ValidationIssueDto } from "../specUtils/error/validationIssueDto.type.ts";

// Garde de chaque problème ce que l'API renvoie au client dans un 400
export function getIssues(
	result: z.ZodSafeParseResult<unknown>,
): ValidationIssueDto[] {
	if (result.success) return [];
	return result.error.issues.map(fromZodIssueToValidationIssueDto);
}
