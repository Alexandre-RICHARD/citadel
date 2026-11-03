import { randomBytes } from "node:crypto";

import { authSettings } from "../../../configuration/authSettings.ts";
import { totpSecretCipher } from "../crypto/totpSecretCipher.ts";
import type { Factor } from "../models/Factor.ts";
import { findAcceptedTotpStep } from "../totp/findAcceptedTotpStep.ts";
import { TOTP_PARAMETERS } from "../totp/totpParameters.ts";

type EncryptedSecret = {
	secretEncrypted: Buffer;
	keyVersion: number;
};

// Un code accepté : son pas, à retenir contre le rejeu, et le secret rechiffré s'il l'était avec la clé précédente
type AcceptedTotp = {
	step: number;
	reencrypted: EncryptedSecret | null;
};

/**
 * Les secrets TOTP : tirés par le serveur, chiffrés en base avec l'id de leur facteur en donnée associée, jamais
 * redonnés après leur création. Un code se vérifie au pas actuel, à ±1 pas près, jamais deux fois
 */
class TotpService {
	createSecret(): Buffer {
		return randomBytes(TOTP_PARAMETERS.secretBytes);
	}

	encrypt(secret: Buffer, factorId: number): EncryptedSecret {
		const { encrypted, keyVersion } = totpSecretCipher.encrypt(
			secret,
			factorId,
		);
		return { secretEncrypted: encrypted, keyVersion };
	}

	// null : le code n'est celui d'aucun pas accepté, ou ce pas a déjà servi
	check(
		factor: Pick<
			Factor,
			"id" | "secretEncrypted" | "keyVersion" | "lastUsedStep"
		>,
		code: string,
		nowMs: number,
	): AcceptedTotp | null {
		if (factor.secretEncrypted === null || factor.keyVersion === null)
			return null;
		const { plaintext, needsReencryption } = totpSecretCipher.decrypt(
			factor.secretEncrypted,
			factor.keyVersion,
			factor.id,
		);
		const step = findAcceptedTotpStep({
			secret: plaintext,
			code,
			nowMs,
			lastUsedStep: factor.lastUsedStep,
			digits: TOTP_PARAMETERS.digits,
			periodSeconds: TOTP_PARAMETERS.periodSeconds,
			driftSteps: authSettings.totp.driftSteps,
		});
		if (step === null) return null;
		return {
			step,
			reencrypted: needsReencryption
				? this.encrypt(plaintext, factor.id)
				: null,
		};
	}
}

export const totpService = new TotpService();
