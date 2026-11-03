import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";

/**
 * L'empreinte d'un code de secours (10 caractères en majuscules, sans tiret), avec la clé des codes : 50 bits de hasard
 * résistent mal à une recherche hors ligne, et sans la clé, absente de la base, une fuite de la base n'en permet aucune
 */
export function hashRecoveryCode(hmacKey: string, code: string): Buffer {
	return computeHmacSha256(hmacKey, code);
}
