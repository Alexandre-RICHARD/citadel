import type { RegistrationPayload } from "../../models/registrationPayload.type.ts";

function isRegistrationPayload(value: unknown): value is RegistrationPayload {
	return (
		typeof value === "object" &&
		value !== null &&
		"username" in value &&
		typeof value.username === "string" &&
		"passwordHash" in value &&
		typeof value.passwordHash === "string"
	);
}

// Le compte qui attend dans le payload d'une inscription. Selon le chemin de lecture, la colonne JSON arrive parsée ou
// en texte. Illisible, c'est un bug : jamais un compte créé à moitié
export function readRegistrationPayload(payload: unknown): RegistrationPayload {
	const value: unknown =
		typeof payload === "string" ? JSON.parse(payload) : payload;
	if (!isRegistrationPayload(value))
		throw new Error("Unreadable registration payload");
	return value;
}
