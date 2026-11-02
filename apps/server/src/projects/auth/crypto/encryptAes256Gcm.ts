import { createCipheriv, randomBytes } from "node:crypto";

const IV_BYTES = 12;

/**
 * AES-256-GCM : chiffre et authentifie. Le résultat, à stocker tel quel, est `iv (12 octets) | chiffré | tag (16)`.
 * L'IV est neuf à chaque appel (jamais deux fois le même avec une même clé, condition de GCM). `associatedData` n'est
 * pas chiffrée mais liée au résultat : déchiffrer avec une autre (autre ligne, autre version de clé) échoue
 */
export function encryptAes256Gcm(
	key: Buffer,
	plaintext: Buffer,
	associatedData: Buffer,
): Buffer {
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	cipher.setAAD(associatedData);
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]);
}
