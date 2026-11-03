// L'alphabet de la RFC 4648 : majuscules et chiffres de 2 à 7, sans 0, 1, 8 ni 9, qu'on confondrait avec O, I, B et g
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BITS_PER_CHARACTER = 5;
const BITS_PER_BYTE = 8;
const CHARACTER_MASK = 0b11111;

/**
 * Base32 de la RFC 4648, sans le remplissage `=` : ce qu'attendent les applications d'authentification (clé à saisir à
 * la main, `secret` de l'URI otpauth), et la forme des codes de secours
 */
export function encodeBase32(bytes: Buffer): string {
	let output = "";
	let buffer = 0;
	let bufferedBits = 0;
	for (const byte of bytes) {
		buffer = (buffer << BITS_PER_BYTE) | byte;
		bufferedBits += BITS_PER_BYTE;
		while (bufferedBits >= BITS_PER_CHARACTER) {
			bufferedBits -= BITS_PER_CHARACTER;
			output += ALPHABET[(buffer >> bufferedBits) & CHARACTER_MASK];
		}
		// Seuls les bits pas encore écrits comptent : le nombre ne grossit jamais
		buffer &= (1 << bufferedBits) - 1;
	}
	if (bufferedBits > 0)
		output +=
			ALPHABET[
				(buffer << (BITS_PER_CHARACTER - bufferedBits)) & CHARACTER_MASK
			];
	return output;
}
