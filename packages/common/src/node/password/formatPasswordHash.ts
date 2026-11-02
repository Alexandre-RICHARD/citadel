import type { PasswordHash } from "./passwordHash.type.ts";
import { PASSWORD_HASH_ALGORITHM } from "./passwordHashAlgorithm.ts";

export function formatPasswordHash({
	parameters,
	salt,
	digest,
}: PasswordHash): string {
	const { memoryKib, passes, parallelism } = parameters;
	return [
		PASSWORD_HASH_ALGORITHM,
		`m=${memoryKib},t=${passes},p=${parallelism}`,
		salt.toString("base64url"),
		digest.toString("base64url"),
	].join(":");
}
