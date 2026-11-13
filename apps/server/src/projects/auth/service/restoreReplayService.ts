import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import type { RestoreJournalLineBean } from "../bean/restoreJournalLineBean.type.ts";
import type { RestoreReplayReportBean } from "../bean/restoreReplayReportBean.type.ts";
import { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";
import { deleteAllFlowsQuery } from "../query/flow/deleteAllFlowsQuery.ts";
import { useRecoveryCodeQuery } from "../query/recoveryCode/useRecoveryCodeQuery.ts";
import { deleteAllSessionsQuery } from "../query/session/deleteAllSessionsQuery.ts";
import { deleteUserQuery } from "../query/user/deleteUserQuery.ts";
import { lockSameUserQuery } from "../query/user/lockSameUserQuery.ts";
import { updateUserEmailQuery } from "../query/user/updateUserEmailQuery.ts";
import { updateUserPasswordQuery } from "../query/user/updateUserPasswordQuery.ts";
import { passwordService } from "./passwordService.ts";
import { projectDataDeletionService } from "./projectDataDeletionService.ts";

type ReplayedLine = Exclude<
	RestoreJournalLineBean,
	{ action: RestoreJournalActionEnum.SECURITY_CHANGED }
>;

// Le compte d'une ligne : son identifiant ne suffit pas, une restauration a pu le redonner à un autre compte
type JournalAccount = Pick<RestoreJournalLineBean, "userId" | "username">;

type SecurityChange = JournalAccount & { lineCount: number };

/**
 * Après une restauration de la base (docs/auth/auth.md, §8.3) : ce que la sauvegarde a fait oublier est
 * refait depuis le journal. Une ligne par transaction, dans l'ordre où elles ont eu lieu, sur le compte qu'elle désigne
 * (même identifiant ET même pseudo), jamais sur un autre qui aurait repris son identifiant
 */
class RestoreReplayService {
	async replay(
		lines: readonly RestoreJournalLineBean[],
	): Promise<RestoreReplayReportBean> {
		const report: RestoreReplayReportBean = {
			replayed: 0,
			skippedMissingAccount: 0,
			emailConflicts: 0,
			invalidatedPasswords: 0,
		};
		// Un compte qui a changé sa sécurité plusieurs fois n'est traité qu'une fois, à la fin : il a pu être supprimé entre-temps
		const securityChanges = new Map<string, SecurityChange>();

		for (const line of lines) {
			if (line.action === RestoreJournalActionEnum.SECURITY_CHANGED) {
				const key = `${line.userId}:${line.username}`;
				const change = securityChanges.get(key);
				securityChanges.set(key, {
					userId: line.userId,
					username: line.username,
					lineCount: (change?.lineCount ?? 0) + 1,
				});
				continue;
			}
			// eslint-disable-next-line no-await-in-loop -- l'ordre compte : deux changements d'email se suivent
			const outcome = await this.#replayLine(line);
			if (outcome === "replayed") report.replayed += 1;
			if (outcome === "missingAccount") report.skippedMissingAccount += 1;
			if (outcome === "emailConflict") report.emailConflicts += 1;
		}

		for (const change of securityChanges.values())
			// eslint-disable-next-line no-await-in-loop -- un hachage à la fois : la file de passwordService est bornée
			if (await this.#invalidatePassword(change)) {
				report.invalidatedPasswords += 1;
				report.replayed += change.lineCount;
			} else report.skippedMissingAccount += change.lineCount;
		return report;
	}

	/**
	 * Toutes les sessions et tous les parcours : une session révoquée après la sauvegarde y est encore, valide. Chacun se
	 * reconnecte ; renvoie le nombre de lignes effacées
	 */
	async closeEverySessionAndFlow(): Promise<{
		sessions: number;
		flows: number;
	}> {
		return {
			sessions: await deleteAllSessionsQuery(),
			flows: await deleteAllFlowsQuery(),
		};
	}

	async #replayLine(
		line: ReplayedLine,
	): Promise<"replayed" | "missingAccount" | "emailConflict"> {
		try {
			return await runInTransaction(
				"Failed to replay the restore journal",
				async (transaction) => {
					if (!(await lockSameUserQuery(line, transaction)))
						return "missingAccount";
					switch (line.action) {
						case RestoreJournalActionEnum.ACCOUNT_DELETED:
							await projectDataDeletionService.deleteAllProjects(
								line.userId,
								transaction,
							);
							await deleteUserQuery(line.userId, transaction);
							break;
						case RestoreJournalActionEnum.PROJECT_DATA_DELETED:
							await projectDataDeletionService.deleteProjectsInTransaction(
								line.userId,
								line.projects,
								transaction,
							);
							break;
						case RestoreJournalActionEnum.EMAIL_CHANGED:
							await updateUserEmailQuery(
								{ userId: line.userId, email: line.email },
								transaction,
							);
							break;
						// Déjà utilisé dans la sauvegarde, ou régénéré depuis : rien ne change, c'est voulu
						case RestoreJournalActionEnum.RECOVERY_CODE_USED:
							await useRecoveryCodeQuery(
								{
									userId: line.userId,
									codeHash: Buffer.from(line.codeHash, "hex"),
									usedAt: line.at,
								},
								transaction,
							);
							break;
					}
					return "replayed";
				},
			);
		} catch (error) {
			if (error instanceof ConflictError) return "emailConflict";
			throw error;
		}
	}

	/**
	 * La sauvegarde a remis l'ancienne sécurité du compte (ancien mot de passe, facteur retiré depuis) : le mot de passe
	 * est remplacé par celui que personne ne connaît, à refaire par « Mot de passe oublié ». Un vrai hachage, pas une
	 * valeur vide : la connexion le vérifie comme les autres et répond « mauvais mot de passe »
	 */
	async #invalidatePassword(account: JournalAccount): Promise<boolean> {
		const passwordHash = await passwordService.hash(createRandomToken());
		return runInTransaction(
			"Failed to invalidate a password after a restore",
			async (transaction) => {
				if (!(await lockSameUserQuery(account, transaction))) return false;
				await updateUserPasswordQuery(
					{ userId: account.userId, passwordHash, changedAt: new Date() },
					transaction,
				);
				return true;
			},
		);
	}
}

export const restoreReplayService = new RestoreReplayService();
