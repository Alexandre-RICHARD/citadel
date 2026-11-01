import { z } from "zod";

import { ValidationIssueCodeEnum } from "../../../../../specUtils/error/validationIssueCode.enum.ts";
import { nullableStringSchema } from "../../../../../specUtils/schemaValidator/string/nullableStringSchema.ts";
import { requiredStringSchema } from "../../../../../specUtils/schemaValidator/string/requiredStringSchema.ts";
import { ContactFieldMaxLengthEnum } from "../../../contactFieldMaxLength.enum.ts";

const emailFormatSchema = z.email();

export const sendContactMessageBodySchema = z.object({
	subject: requiredStringSchema("Subject", ContactFieldMaxLengthEnum.SUBJECT),
	message: requiredStringSchema("Message", ContactFieldMaxLengthEnum.MESSAGE),
	// Facultatif : sans adresse, ni réponse possible ni accusé de réception
	email: nullableStringSchema("Email", ContactFieldMaxLengthEnum.EMAIL).refine(
		(email) => email === null || emailFormatSchema.safeParse(email).success,
		{
			message: "Email should be a valid address",
			params: { code: ValidationIssueCodeEnum.INVALID_FORMAT },
		},
	),
	name: nullableStringSchema("Name", ContactFieldMaxLengthEnum.NAME),
	// Champ piège, caché aux humains et toujours vide pour eux : un robot qui le remplit reçoit un succès, et rien ne part
	website: z
		.string({ message: "Website should be a string" })
		.max(ContactFieldMaxLengthEnum.HONEYPOT, {
			message: `Website should contain at most ${ContactFieldMaxLengthEnum.HONEYPOT} characters`,
		}),
});
