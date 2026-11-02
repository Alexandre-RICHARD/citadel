import { hasInvisibleCharacter } from "@citadel/common/src/universal/string/hasInvisibleCharacter.ts";
import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";
import { normalizeDisplayName } from "../helper/normalizeDisplayName.ts";

/**
 * Le pseudo affiché, libre (accents, espaces, symboles, émojis), sans unicité. Normalisé avant d'être compté ; vide, il
 * devient null : le pseudo prend sa place. Aucun caractère invisible, qui ferait passer un pseudo affiché pour un autre
 */
export const displayNameSchema = z
	.string({ message: "Display name should be a string" })
	.transform(normalizeDisplayName)
	.refine((value) => value.isWellFormed() && !hasInvisibleCharacter(value), {
		message: "Display name should not contain invisible characters",
		params: { code: ValidationIssueCodeEnum.INVALID_CHARACTERS },
	})
	.refine(
		(value) => Array.from(value).length <= AUTH_FIELD_LENGTHS.displayNameMax,
		{
			message: `Display name should contain at most ${AUTH_FIELD_LENGTHS.displayNameMax} characters`,
			params: {
				code: ValidationIssueCodeEnum.TOO_LONG,
				limit: AUTH_FIELD_LENGTHS.displayNameMax,
			},
		},
	)
	.transform((value) => (value === "" ? null : value));
