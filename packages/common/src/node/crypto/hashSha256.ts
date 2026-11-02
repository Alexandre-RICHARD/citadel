import { createHash } from "node:crypto";

// L'empreinte d'un jeton tiré au hasard, 32 octets (BINARY(32) en base) : la base ne garde jamais le jeton lui-même,
// une fuite ne donne donc aucune session. Pas pour un mot de passe, trop vite essayé : hashPassword
export function hashSha256(value: string): Buffer {
	return createHash("sha256").update(value, "utf8").digest();
}
