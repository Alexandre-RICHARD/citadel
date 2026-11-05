import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { authSettings } from "../../../configuration/authSettings.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { createRecoveryCodes } from "../helper/recoveryCode/createRecoveryCodes.ts";
import { hashRecoveryCode } from "../helper/recoveryCode/hashRecoveryCode.ts";
import { findConfirmedFactorTypesQuery } from "../query/factor/findConfirmedFactorTypesQuery.ts";
import { replaceRecoveryCodesQuery } from "../query/recoveryCode/replaceRecoveryCodesQuery.ts";
import { useRecoveryCodeQuery } from "../query/recoveryCode/useRecoveryCodeQuery.ts";
import { lockUserQuery } from "../query/user/lockUserQuery.ts";
import { authEventService } from "./authEventService.ts";
import { passwordConfirmationService } from "./passwordConfirmationService.ts";
import { restoreJournalService } from "./restoreJournalService.ts";

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

	// De nouveaux codes, mot de passe redemandé : les anciens ne valent plus
	async regenerate(
		userId: number,
		password: string,
		client: ClientContextBean,
	): Promise<string[]> {
		await passwordConfirmationService.confirm(userId, password, client);
		const codes = await runInTransaction(
			"Failed to regenerate recovery codes",
			async (transaction) => {
				await lockUserQuery(userId, transaction);
				const factorTypes = await findConfirmedFactorTypesQuery(
					userId,
					transaction,
				);
				if (factorTypes.length === 0)
					throw new RejectedRequestError(
						AuthErrorCodeEnum.NO_SECOND_FACTOR,
						"No second factor to recover",
					);
				return this.#replace(userId, transaction);
			},
		);
		await restoreJournalService.record({
			userId: userId,
			action: RestoreJournalActionEnum.SECURITY_CHANGED,
		});
		await authEventService.record({
			type: AuthEventTypeEnum.RECOVERY_CODES_REGENERATED,
			userId,
			client,
		});
		return codes;
	}

	// Le code tapé (tel que son schéma le nettoie), une seule fois. false : inconnu de ce compte, ou déjà utilisé
	async use(
		userId: number,
		code: string,
		transaction: Transaction,
	): Promise<boolean> {
		return useRecoveryCodeQuery(
			{
				userId,
				codeHash: hashRecoveryCode(authSettings.code.hmacKey, code),
				usedAt: new Date(),
			},
			transaction,
		);
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
