import { hasInvisibleCharacter } from "@citadel/common/src/universal/string/hasInvisibleCharacter.ts";
import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";
import { isEmailAddress } from "../helper/isEmailAddress.ts";

/**
 * L'adresse du compte, gardée telle que saisie (le mail part à cette adresse), sans les espaces autour. La base compare
 * les adresses sans la casse, mais confondrait aussi ａ (pleine chasse) et a, ﬁ et fi, et ignorerait les caractères
 * invisibles : ces caractères sont donc refusés ici. Une adresse que la normalisation NFKC change en contient un
 */
export const emailSchema = z
	.string({ message: "Email should be a string" })
	.trim()
	.max(AUTH_FIELD_LENGTHS.emailMax, {
		message: `Email should contain at most ${AUTH_FIELD_LENGTHS.emailMax} characters`,
	})
	.refine(
		(value) =>
			value.isWellFormed() &&
			value.normalize("NFKC") === value &&
			!hasInvisibleCharacter(value),
		{
			message: "Email should not contain look-alike or invisible characters",
			params: { code: ValidationIssueCodeEnum.INVALID_CHARACTERS },
		},
	)
	.refine(isEmailAddress, {
		message: "Email should be a valid address",
		params: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
	});
