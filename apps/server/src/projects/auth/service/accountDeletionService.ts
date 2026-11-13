import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { RejectedRequestError } from "../../../error/RejectedRequestError.ts";
import { TooManyRequestsError } from "../../../error/TooManyRequestsError.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { authLimiter } from "../limit/authLimiter.ts";
import type { Factor } from "../models/Factor.ts";
import { findConfirmedFactorsQuery } from "../query/factor/findConfirmedFactorsQuery.ts";
import { recordTotpUseQuery } from "../query/factor/recordTotpUseQuery.ts";
import { deleteUserQuery } from "../query/user/deleteUserQuery.ts";
import { lockUserQuery } from "../query/user/lockUserQuery.ts";
import { buildSecurityNoticeMail } from "../template/buildSecurityNoticeMail.ts";
import { authEventService } from "./authEventService.ts";
import { authMailService } from "./authMailService.ts";
import { passwordConfirmationService } from "./passwordConfirmationService.ts";
import { projectDataDeletionService } from "./projectDataDeletionService.ts";
import { recoveryCodeService } from "./recoveryCodeService.ts";
import { restoreJournalService } from "./restoreJournalService.ts";
import { totpService } from "./totpService.ts";

type DeletionProof = {
	password: string;
	// Tel que son schéma le nettoie : chiffres seuls, ou code de secours en majuscules sans tiret
	secondFactor?:
		| {
				method:
					SecondFactorMethodEnum.TOTP | SecondFactorMethodEnum.RECOVERY_CODE;
				code: string;
		  }
		| undefined;
};

// Ce que le second facteur a prouvé, à consommer dans la transaction de la suppression
type SecondFactorProof =
	| { method: SecondFactorMethodEnum.TOTP; factorId: number; step: number }
	| { method: SecondFactorMethodEnum.RECOVERY_CODE; code: string };

function invalidCode(): RejectedRequestError {
	return new RejectedRequestError(
		AuthErrorCodeEnum.INVALID_CODE,
		"Wrong or already used second factor code",
	);
}

/**
 * La suppression du compte : immédiate et définitive, aucun délai de récupération. Le mot de passe est redemandé, et un
 * code de l'application d'authentification (ou un code de secours) quand le compte en a une : une session volée ne
 * suffit pas. Un compte qui n'a que le facteur email n'en doit pas, comme à la connexion par email : ce facteur ne
 * protège que d'un mot de passe volé, et le mot de passe est ici redemandé. Les échecs comptent comme ceux de la
 * connexion
 */
class AccountDeletionService {
	async delete(
		userId: number,
		{ password, secondFactor }: DeletionProof,
		client: ClientContextBean,
	): Promise<void> {
		const totpFactors = (await findConfirmedFactorsQuery(userId)).filter(
			(factor) => factor.type === FactorTypeEnum.TOTP,
		);
		// Avec une application, le code suit : les échecs du compte ne repartent de zéro qu'une fois le code accepté
		const user = await passwordConfirmationService.confirm(
			userId,
			password,
			client,
			{ resetsFailures: totpFactors.length === 0 },
		);
		const attempt = { accountKey: String(userId), ip: client.ip };
		const proof =
			totpFactors.length === 0
				? null
				: await this.#verifySecondFactor(
						userId,
						totpFactors,
						secondFactor,
						client,
					);

		const isDeleted = await runInTransaction(
			"Failed to delete account",
			async (transaction) => {
				// Le compte est verrouillé : deux suppressions, ou une suppression et un changement de sa sécurité, se suivent
				if (!(await lockUserQuery(userId, transaction)))
					throw new Error("Deletion of an already deleted account");
				// Un code de secours inconnu ou déjà utilisé, ou un pas TOTP déjà servi, ne se voit qu'ici : refus compté
				// comme un échec, hors de la transaction
				if (
					proof !== null &&
					!(await this.#consume(proof, userId, transaction))
				)
					return false;
				// Les projets d'abord, chacun dans son ordre : les cascades du compte ne décident de rien (§5.1)
				await restoreJournalService.write(
					{ userId, action: RestoreJournalActionEnum.ACCOUNT_DELETED },
					transaction,
				);
				await projectDataDeletionService.deleteAllProjects(userId, transaction);
				await deleteUserQuery(userId, transaction);
				return true;
			},
		);
		if (!isDeleted) {
			await this.#rejectCode(attempt, userId, client);
			throw invalidCode();
		}

		authMailService.sendWithoutWaiting(
			buildSecurityNoticeMail(
				MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED,
				user.email,
			),
		);
		// Sans compte : le journal du compte est parti avec lui par cascade, l'événement n'a plus d'utilisateur
		await authEventService.record({
			type: AuthEventTypeEnum.ACCOUNT_DELETED,
			userId: null,
			client,
		});
	}

	async #verifySecondFactor(
		userId: number,
		totpFactors: Factor[],
		answer: DeletionProof["secondFactor"],
		client: ClientContextBean,
	): Promise<SecondFactorProof> {
		if (answer === undefined)
			throw new RejectedRequestError(
				AuthErrorCodeEnum.SECOND_FACTOR_REQUIRED,
				"The account has an authenticator app: a code is needed",
			);

		const attempt = { accountKey: String(userId), ip: client.ip };
		const retryAfterMs = authLimiter.getAttemptRetryAfterMs(attempt);
		if (retryAfterMs !== null)
			throw new TooManyRequestsError(
				"Wait before trying this account again",
				retryAfterMs,
				AuthErrorCodeEnum.TOO_MANY_ATTEMPTS,
			);

		// Un code de secours ne se vérifie qu'en le consommant, dans la transaction
		const proof: SecondFactorProof | null =
			answer.method === SecondFactorMethodEnum.RECOVERY_CODE
				? { method: answer.method, code: answer.code }
				: this.#findAcceptingTotp(totpFactors, answer.code);
		if (proof === null) {
			await this.#rejectCode(attempt, userId, client);
			throw invalidCode();
		}
		return proof;
	}

	async #rejectCode(
		attempt: { accountKey: string; ip: string },
		userId: number,
		client: ClientContextBean,
	): Promise<void> {
		authLimiter.recordFailure(attempt);
		await authEventService.record({
			type: AuthEventTypeEnum.SECOND_FACTOR_FAILED,
			userId,
			client,
		});
	}

	// Le code est essayé sur chaque TOTP du compte : celui qui l'accepte est celui de l'application utilisée
	#findAcceptingTotp(
		totpFactors: Factor[],
		code: string,
	): SecondFactorProof | null {
		const nowMs = Date.now();
		for (const factor of totpFactors) {
			const accepted = totpService.check(factor, code, nowMs);
			if (accepted !== null)
				return {
					method: SecondFactorMethodEnum.TOTP,
					factorId: factor.id,
					step: accepted.step,
				};
		}
		return null;
	}

	// false : le code a déjà servi entre-temps, ou le code de secours est inconnu ou utilisé
	async #consume(
		proof: SecondFactorProof,
		userId: number,
		transaction: Transaction,
	): Promise<boolean> {
		if (proof.method === SecondFactorMethodEnum.RECOVERY_CODE)
			return recoveryCodeService.use(userId, proof.code, transaction);
		return recordTotpUseQuery(
			{
				factorId: proof.factorId,
				step: proof.step,
				usedAt: new Date(),
				reencrypted: null,
			},
			transaction,
		);
	}
}

export const accountDeletionService = new AccountDeletionService();
