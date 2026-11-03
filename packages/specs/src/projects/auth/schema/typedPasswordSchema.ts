import { z } from "zod";

// Seule borne d'un mot de passe tapé pour se connecter ou confirmer une action : un hash ne se calcule pas sur un texte
// démesuré
const TYPED_PASSWORD_MAX_LENGTH = 1024;

// Le mot de passe actuel, tapé pour se connecter ou confirmer une action sensible. Ni longueur minimale ni autre règle :
// un mot de passe hors des règles est un mauvais mot de passe, même réponse
export const typedPasswordSchema = z
	.string({ message: "Password should be a string" })
	.max(TYPED_PASSWORD_MAX_LENGTH, {
		message: `Password should contain at most ${TYPED_PASSWORD_MAX_LENGTH} characters`,
	})
	.transform((value) => value.normalize("NFC"));
