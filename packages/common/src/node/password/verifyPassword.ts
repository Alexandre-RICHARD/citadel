import { isEqualInConstantTime } from "../crypto/isEqualInConstantTime.ts";
import { deriveArgon2id } from "./deriveArgon2id.ts";
import { parsePasswordHash } from "./parsePasswordHash.ts";

// Recalcule avec le sel et les paramètres du hash stocké, puis compare en temps constant. Un hash illisible refuse tout
export async function verifyPassword(
	password: string,
	storedHash: string,
): Promise<boolean> {
	const passwordHash = parsePasswordHash(storedHash);
	if (passwordHash === null) return false;

	const digest = await deriveArgon2id(
		password,
		passwordHash.salt,
		passwordHash.parameters,
	);
	return isEqualInConstantTime(digest, passwordHash.digest);
}
