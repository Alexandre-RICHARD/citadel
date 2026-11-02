import { z } from "zod";

import { AUTH_FIELD_LENGTHS } from "../authFieldLengths.ts";

// Ni espace, ni accent, ni « @ » : un pseudo ne se confond jamais avec une adresse email à la connexion
const USERNAME_CHARACTERS = /^[A-Za-z0-9_-]*$/u;

// L'identifiant définitif du compte. Sensible à chaque caractère : Alex et alex sont deux comptes
export const usernameSchema = z
	.string({ message: "Username should be a string" })
	.min(1, { message: "Username should contain at least 1 character" })
	.max(AUTH_FIELD_LENGTHS.usernameMax, {
		message: `Username should contain at most ${AUTH_FIELD_LENGTHS.usernameMax} characters`,
	})
	.regex(USERNAME_CHARACTERS, {
		message: "Username should contain only A-Z, a-z, 0-9, _ and -",
	});
