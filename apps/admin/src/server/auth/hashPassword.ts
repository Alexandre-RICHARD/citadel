import { randomBytes, scryptSync } from "node:crypto";

// scrypt : lent et gourmand en mémoire exprès, pour qu'essayer des milliards de mots de
// passe sur le hachage coûte trop cher. Inclus dans Node, aucune dépendance.
// Format « scrypt:<sel>:<hachage> », en hexadécimal : aucun « $ », que Compose prendrait
// pour une variable dans .env.prod.
export function hashPassword(password: string): string {
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, 64);
	return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}
