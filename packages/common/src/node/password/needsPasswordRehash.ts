import type { Argon2Parameters } from "./argon2Parameters.type.ts";
import { parsePasswordHash } from "./parsePasswordHash.ts";

/**
 * Vrai quand le hash stocké n'a pas les paramètres du moment : il est refait à la prochaine connexion réussie de son
 * propriétaire, seul moment où le serveur connaît le mot de passe
 */
export function needsPasswordRehash(
	storedHash: string,
	parameters: Argon2Parameters,
): boolean {
	const passwordHash = parsePasswordHash(storedHash);
	if (passwordHash === null) return true;

	const stored = passwordHash.parameters;
	return (
		stored.memoryKib !== parameters.memoryKib ||
		stored.passes !== parameters.passes ||
		stored.parallelism !== parameters.parallelism
	);
}
