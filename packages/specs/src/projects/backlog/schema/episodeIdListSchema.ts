import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { bodyIdSchema } from "../../../specUtils/schemaValidator/id/bodyIdSchema.ts";

// Les plus longues séries dépassent le millier d'épisodes : cocher toute la série les envoie tous d'un coup
const MAX_EPISODE_COUNT = 5000;

// Épisodes d'une même série, chacun une seule fois, au moins un
export function episodeIdListSchema(label: string) {
	return z
		.array(bodyIdSchema(`${label} item`), {
			message: `${label} should be an array of ids`,
		})
		.min(1, { message: `${label} should contain at least one id` })
		.max(MAX_EPISODE_COUNT, {
			message: `${label} should contain at most ${MAX_EPISODE_COUNT} ids`,
		})
		.refine((ids) => new Set(ids).size === ids.length, {
			message: `${label} should not contain the same id twice`,
			params: { code: ValidationIssueCodeEnum.DUPLICATE_VALUE },
		});
}
