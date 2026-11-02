import { decryptAes256Gcm } from "./decryptAes256Gcm.ts";
import { encryptAes256Gcm } from "./encryptAes256Gcm.ts";

type Options = {
	// Clés de 32 octets en hexadécimal (AUTH_TOTP_ENCRYPTION_KEY…)
	currentKey: string;
	currentKeyVersion: number;
	// Pendant une rotation seulement : la clé de la version précédente
	previousKey: string | null;
};

type EncryptedSecret = {
	encrypted: Buffer;
	keyVersion: number;
};

type DecryptedSecret = {
	plaintext: Buffer;
	// Chiffré avec la clé précédente : à rechiffrer avec la clé du moment, à son prochain usage
	needsReencryption: boolean;
};

// La version de la clé et l'identifiant de la ligne : un secret copié sur une autre ligne ne se déchiffre pas
function buildAssociatedData(keyVersion: number, recordId: number): Buffer {
	return Buffer.from(`${keyVersion}:${recordId}`, "utf8");
}

/**
 * Chiffrement des secrets gardés en base (secrets TOTP) : AES-256-GCM, clé versionnée. Rotation : une nouvelle clé
 * prend la version suivante, l'ancienne passe en clé précédente le temps que chaque secret soit rechiffré
 */
export function createSecretCipher({
	currentKey,
	currentKeyVersion,
	previousKey,
}: Options) {
	const keysByVersion = new Map<number, Buffer>([
		[currentKeyVersion, Buffer.from(currentKey, "hex")],
	]);
	if (previousKey !== null)
		keysByVersion.set(currentKeyVersion - 1, Buffer.from(previousKey, "hex"));

	function encrypt(plaintext: Buffer, recordId: number): EncryptedSecret {
		const key = keysByVersion.get(currentKeyVersion);
		if (key === undefined) throw new Error("Current key missing");
		return {
			encrypted: encryptAes256Gcm(
				key,
				plaintext,
				buildAssociatedData(currentKeyVersion, recordId),
			),
			keyVersion: currentKeyVersion,
		};
	}

	function decrypt(
		encrypted: Buffer,
		keyVersion: number,
		recordId: number,
	): DecryptedSecret {
		const key = keysByVersion.get(keyVersion);
		if (key === undefined)
			throw new Error(`No encryption key for version ${keyVersion}`);
		return {
			plaintext: decryptAes256Gcm(
				key,
				encrypted,
				buildAssociatedData(keyVersion, recordId),
			),
			needsReencryption: keyVersion !== currentKeyVersion,
		};
	}

	return { encrypt, decrypt };
}
