import { z } from "zod";

import { booleanSchema } from "../../../../../specUtils/schemaValidator/boolean/booleanSchema.ts";
import { identifierSchema } from "../../../schema/identifierSchema.ts";

// Seule borne d'un mot de passe tapé pour se connecter : un hash ne se calcule pas sur un texte démesuré
const TYPED_PASSWORD_MAX_LENGTH = 1024;

export const loginWithPasswordBodySchema = z.object({
	identifier: identifierSchema,
	// Ni longueur minimale ni autre règle : un mot de passe hors des règles est un mauvais mot de passe, même réponse
	password: z
		.string({ message: "Password should be a string" })
		.max(TYPED_PASSWORD_MAX_LENGTH, {
			message: `Password should contain at most ${TYPED_PASSWORD_MAX_LENGTH} characters`,
		})
		.transform((value) => value.normalize("NFC")),
	remember: booleanSchema("Remember"),
});
