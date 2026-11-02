import { createDecipheriv } from "node:crypto";

const IV_BYTES = 12;
const TAG_BYTES = 16;

// L'inverse d'encryptAes256Gcm. Lève une erreur si un octet a changé, ou si la clé ou la donnée associée diffèrent
export function decryptAes256Gcm(
	key: Buffer,
	encrypted: Buffer,
	associatedData: Buffer,
): Buffer {
	if (encrypted.length < IV_BYTES + TAG_BYTES)
		throw new Error("Encrypted value too short");

	const iv = encrypted.subarray(0, IV_BYTES);
	const tag = encrypted.subarray(encrypted.length - TAG_BYTES);
	const ciphertext = encrypted.subarray(IV_BYTES, encrypted.length - TAG_BYTES);

	const decipher = createDecipheriv("aes-256-gcm", key, iv, {
		authTagLength: TAG_BYTES,
	});
	decipher.setAAD(associatedData);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
