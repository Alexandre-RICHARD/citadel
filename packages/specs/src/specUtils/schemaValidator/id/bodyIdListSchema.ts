import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "./bodyIdSchema.ts";

// Assez pour toutes les versions ou tous les DLC d'un jeu, assez peu pour borner une requête SQL `IN (…)`
const MAX_ID_COUNT = 500;

// Liste d'ids d'un corps JSON, chacun une seule fois ; une liste vide est acceptée
export function bodyIdListSchema(label: string) {
	return z
		.array(bodyIdSchema(`${label} item`), {
			message: `${label} should be an array of ids`,
		})
		.max(MAX_ID_COUNT, {
			message: `${label} should contain at most ${MAX_ID_COUNT} ids`,
		})
		.refine((ids) => new Set(ids).size === ids.length, {
			message: `${label} should not contain the same id twice`,
			params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
		});
}
