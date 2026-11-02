import { z } from "zod";

import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";

// L'email ou le pseudo tapé pour se connecter (avec « @ », c'est un email : un pseudo n'en contient jamais). Seule la
// longueur est vérifiée : un identifiant mal formé est un identifiant inconnu, avec la même réponse
export const identifierSchema = z
	.string({ message: "Identifier should be a string" })
	.trim()
	.min(1, { message: "Identifier should contain at least 1 character" })
	.max(AUTH_FIELD_LENGTHS.emailMax, {
		message: `Identifier should contain at most ${AUTH_FIELD_LENGTHS.emailMax} characters`,
	});
