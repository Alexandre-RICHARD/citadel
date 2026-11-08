import { createHmac } from "node:crypto";

import { decodeBase32 } from "./decodeBase32.ts";

const PERIOD_SECONDS = 30;
const DIGITS = 6;

/**
 * Le code que ferait afficher une application d'authentification (RFC 6238 : HMAC-SHA1, 6 chiffres, pas de 30 s) pour
 * la clé donnée. `stepOffset` : 0 le pas actuel, -1 le précédent, 1 le suivant (le serveur accepte ces trois-là)
 */
export function computeTotp(secret: string, stepOffset = 0): string {
	const counter = Math.floor(Date.now() / 1000 / PERIOD_SECONDS) + stepOffset;
	const message = Buffer.alloc(8);
	message.writeBigUInt64BE(BigInt(counter));
	const hash = createHmac("sha1", decodeBase32(secret))
		.update(message)
		.digest();
	const offset = (hash.at(-1) ?? 0) & 0x0f;
	const binary = hash.readUInt32BE(offset) & 0x7fffffff;
	return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}
