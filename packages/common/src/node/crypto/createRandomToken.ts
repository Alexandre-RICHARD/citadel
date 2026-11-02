import { randomBytes } from "node:crypto";

// Hasard cryptographique : 32 octets (256 bits) ne se devinent pas. base64url par défaut, sans « + », « / » ni « = » :
// sans échappement dans un cookie ou une URL. hex quand seuls les chiffres et les lettres sont permis
export function createRandomToken(
	byteLength = 32,
	encoding: "base64url" | "hex" = "base64url",
): string {
	return randomBytes(byteLength).toString(encoding);
}
