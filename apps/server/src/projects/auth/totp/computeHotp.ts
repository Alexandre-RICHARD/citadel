import { createHmac } from "node:crypto";

const COUNTER_BYTES = 8;
const OFFSET_MASK = 0x0f;
const SIGN_BIT_MASK = 0x7f_ff_ff_ff;
const DECIMAL_BASE = 10;

/**
 * Le code HOTP de la RFC 4226 pour un compteur : HMAC-SHA-1 du compteur sur 8 octets, puis 4 octets pris à l'endroit que
 * désigne le dernier (troncature dynamique), réduits à `digits` chiffres, zéros de tête compris
 */
export function computeHotp(
	secret: Buffer,
	counter: number,
	digits: number,
): string {
	const counterBytes = Buffer.alloc(COUNTER_BYTES);
	counterBytes.writeBigUInt64BE(BigInt(counter));
	const digest = createHmac("sha1", secret).update(counterBytes).digest();

	const offset = digest[digest.length - 1] & OFFSET_MASK;
	const truncated = digest.readUInt32BE(offset) & SIGN_BIT_MASK;
	return String(truncated % DECIMAL_BASE ** digits).padStart(digits, "0");
}
