import { authSettings } from "../../../configuration/authSettings.ts";
import { createSecretCipher } from "./createSecretCipher.ts";

// Le chiffrement des secrets TOTP, avec la clé du moment et, pendant une rotation, la précédente
export const totpSecretCipher = createSecretCipher({
	currentKey: authSettings.totp.encryptionKey,
	currentKeyVersion: authSettings.totp.encryptionKeyVersion,
	previousKey: authSettings.totp.previousEncryptionKey,
});
