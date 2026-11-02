import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../specUtils/error/validationIssueCode.enum.ts";
import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";

const MAIL_CODE = new RegExp(`^\\d{${AUTH_FIELD_LENGTHS.mailCode}}$`, "u");

// Le code reçu par mail, 6 chiffres. Collé depuis le mail ou une notification, il arrive parfois avec des espaces
export const mailCodeSchema = z
	.string({ message: "Code should be a string" })
	.transform((value) => value.replace(/\s/gu, ""))
	.refine((value) => MAIL_CODE.test(value), {
		message: `Code should contain ${AUTH_FIELD_LENGTHS.mailCode} digits`,
		params: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
	});
