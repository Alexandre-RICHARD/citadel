import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";

/**
 * Un code de `digits` chiffres (reçu par email, ou donné par l'application d'authentification). Collé depuis un email,
 * une notification ou l'application, il arrive parfois avec des espaces
 */
export function digitCodeSchema(digits: number) {
	const pattern = new RegExp(`^\\d{${digits}}$`, "u");
	return z
		.string({ message: "Code should be a string" })
		.transform((value) => value.replace(/\s/gu, ""))
		.refine((value) => pattern.test(value), {
			message: `Code should contain ${digits} digits`,
			params: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
		});
}
