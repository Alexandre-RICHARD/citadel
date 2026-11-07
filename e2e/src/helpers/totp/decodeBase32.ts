const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Une clé en base32 (celle que l'application d'authentification reçoit) en octets ; espaces et « = » ignorés */
export function decodeBase32(text: string): Buffer {
	const cleaned = text.replace(/[\s=]/gu, "").toUpperCase();
	let bits = "";
	for (const character of cleaned) {
		const value = BASE32_ALPHABET.indexOf(character);
		if (value === -1)
			throw new Error(`« ${character} » n'est pas un caractère base32`);
		bits += value.toString(2).padStart(5, "0");
	}
	const bytes: number[] = [];
	for (let index = 0; index + 8 <= bits.length; index += 8)
		bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
	return Buffer.from(bytes);
}
