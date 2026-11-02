import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";

// Les conditions du mot de passe, vérifiées en direct sous le champ. Comptées comme le serveur : après NFC, un « é » tapé
// en deux touches compte pour un caractère, un émoji aussi
export function checkPasswordLength(password: string): {
	hasMinLength: boolean;
	hasMaxLength: boolean;
} {
	const length = Array.from(password.normalize("NFC")).length;
	return {
		hasMinLength: length >= AUTH_FIELD_LENGTHS.passwordMin,
		hasMaxLength: length <= AUTH_FIELD_LENGTHS.passwordMax,
	};
}
