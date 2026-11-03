import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";

// Base32 de la RFC 4648 : majuscules et chiffres de 2 à 7
const RECOVERY_CODE = new RegExp(
	`^[A-Z2-7]{${AUTH_FIELD_LENGTHS.recoveryCode}}$`,
	"u",
);

/**
 * Un code de secours, tel qu'il est gardé : 10 caractères en majuscules, sans le tiret ni les espaces de l'affichage.
 * Recopié depuis le fichier téléchargé ou un papier, il peut arriver en minuscules, avec ou sans son tiret
 */
export const recoveryCodeSchema = z
	.string({ message: "Recovery code should be a string" })
	.transform((value) => value.replace(/[\s-]/gu, "").toUpperCase())
	.refine((value) => RECOVERY_CODE.test(value), {
		message: `Recovery code should contain ${AUTH_FIELD_LENGTHS.recoveryCode} letters or digits from 2 to 7`,
		params: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
	});
