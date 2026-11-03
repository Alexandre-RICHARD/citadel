import type { Transaction } from "sequelize";

import { authSettings } from "../../../configuration/authSettings.ts";
import { createRecoveryCodes } from "../helper/recoveryCode/createRecoveryCodes.ts";
import { findConfirmedFactorTypesQuery } from "../query/factor/findConfirmedFactorTypesQuery.ts";
import { replaceRecoveryCodesQuery } from "../query/recoveryCode/replaceRecoveryCodesQuery.ts";

/**
 * Les codes de secours, la roue de secours du second facteur (téléphone perdu, boîte mail inaccessible) : 10 codes à
 * usage unique, créés avec le premier facteur du compte, montrés une seule fois, gardés en empreintes
 */
class RecoveryCodeService {
	/**
	 * Dans la transaction qui vient d'activer un facteur, compte verrouillé : s'il est le seul actif, les codes de
	 * secours du compte, montrés cette seule fois ; null sinon, les codes existants restent valables
	 */
	async issueForFirstFactor(
		userId: number,
		transaction: Transaction,
	): Promise<string[] | null> {
		const factorTypes = await findConfirmedFactorTypesQuery(
			userId,
			transaction,
		);
		if (factorTypes.length !== 1) return null;
		return this.#replace(userId, transaction);
	}

	async #replace(userId: number, transaction: Transaction): Promise<string[]> {
		const { codes, codeHashes } = createRecoveryCodes(
			authSettings.recoveryCodesCount,
			authSettings.code.hmacKey,
		);
		await replaceRecoveryCodesQuery(userId, codeHashes, transaction);
		return codes;
	}
}

export const recoveryCodeService = new RecoveryCodeService();
