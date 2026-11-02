import type { Argon2Parameters } from "./argon2Parameters.type.ts";
import type { PasswordHash } from "./passwordHash.type.ts";
import { PASSWORD_HASH_ALGORITHM } from "./passwordHashAlgorithm.ts";

const PARAMETERS_PATTERN = /^m=(\d+),t=(\d+),p=(\d+)$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
// Argon2 exige au moins 8 Kio par fil de calcul
const MIN_MEMORY_KIB_PER_THREAD = 8;

function parseParameters(text: string): Argon2Parameters | null {
	const [, memoryKib, passes, parallelism] =
		PARAMETERS_PATTERN.exec(text)?.map(Number) ?? [];
	if (
		memoryKib === undefined ||
		passes === undefined ||
		parallelism === undefined
	)
		return null;
	// Des paramètres qu'argon2 refuserait : le hash est illisible, pas une erreur au moment de vérifier
	if (
		parallelism < 1 ||
		passes < 1 ||
		memoryKib < MIN_MEMORY_KIB_PER_THREAD * parallelism
	)
		return null;
	return { memoryKib, passes, parallelism };
}

function parseBase64url(text: string | undefined): Buffer | null {
	if (text === undefined || !BASE64URL_PATTERN.test(text)) return null;
	return Buffer.from(text, "base64url");
}

// null pour tout ce qui n'est pas un hash de formatPasswordHash (ancien scrypt de la console, texte abîmé)
export function parsePasswordHash(storedHash: string): PasswordHash | null {
	const [algorithm, parametersText, saltText, digestText, ...rest] =
		storedHash.split(":");
	if (
		algorithm !== PASSWORD_HASH_ALGORITHM ||
		parametersText === undefined ||
		rest.length > 0
	)
		return null;

	const parameters = parseParameters(parametersText);
	const salt = parseBase64url(saltText);
	const digest = parseBase64url(digestText);
	if (parameters === null || salt === null || digest === null) return null;
	return { parameters, salt, digest };
}
