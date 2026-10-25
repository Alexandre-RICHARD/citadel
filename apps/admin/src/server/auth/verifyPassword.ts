import { scryptSync, timingSafeEqual } from "node:crypto";

// Compare en temps constant : la durée de la réponse ne dit pas combien de caractères
// étaient justes
export function verifyPassword(password: string, storedHash: string): boolean {
	const [algorithm, saltHex, hashHex] = storedHash.split(":");
	if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;

	const expected = Buffer.from(hashHex, "hex");
	const actual = scryptSync(
		password,
		Buffer.from(saltHex, "hex"),
		expected.length,
	);
	return timingSafeEqual(actual, expected);
}
