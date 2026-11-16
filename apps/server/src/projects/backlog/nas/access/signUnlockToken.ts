import { computeHmacSha256 } from "@citadel/common/src/node/crypto/computeHmacSha256.ts";

/**
 * Le jeton du cookie de déverrouillage : le compte et la fin du déverrouillage, signés. La clé est le hash du mot de
 * passe des médias, secret comme lui : changer le mot de passe annule tous les déverrouillages, sans autre variable
 */
export function signUnlockToken(
	userId: number,
	expiresAtMs: number,
	key: string,
): string {
	const payload = `${userId}.${expiresAtMs}`;
	return `${payload}.${computeHmacSha256(key, payload).toString("base64url")}`;
}
