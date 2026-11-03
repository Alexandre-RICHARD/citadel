import { hasInvisibleCharacter } from "@citadel/common/src/universal/string/hasInvisibleCharacter.ts";
import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";
import { normalizeDisplayName } from "../helper/normalizeDisplayName.ts";

/**
 * Le nom d'un facteur, pour le reconnaître dans la liste (« Téléphone », « Bitwarden »). Libre, nettoyé comme le pseudo
 * affiché, obligatoire, sans caractère invisible
 */
export const factorNameSchema = z
	.string({ message: "Factor name should be a string" })
	.transform(normalizeDisplayName)
	.refine((value) => value.isWellFormed() && !hasInvisibleCharacter(value), {
		message: "Factor name should not contain invisible characters",
		params: { code: ValidationIssueCodeEnum.INVALID_CHARACTERS },
	})
	.refine((value) => value !== "", {
		message: "Factor name should contain at least 1 character",
		params: { code: ValidationIssueCodeEnum.TOO_SHORT, limit: 1 },
	})
	.refine(
		(value) => Array.from(value).length <= AUTH_FIELD_LENGTHS.factorNameMax,
		{
			message: `Factor name should contain at most ${AUTH_FIELD_LENGTHS.factorNameMax} characters`,
			params: {
				code: ValidationIssueCodeEnum.TOO_LONG,
				limit: AUTH_FIELD_LENGTHS.factorNameMax,
			},
		},
	);
