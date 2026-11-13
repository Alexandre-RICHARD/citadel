import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { applyFirstFinishCount } from "@citadel/specs/src/projects/backlog/helper/status/applyFirstFinishCount.ts";
import { isStatusAllowed } from "@citadel/specs/src/projects/backlog/helper/status/isStatusAllowed.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateUserVersionBean } from "../bean/createUserVersionBean.type.ts";
import type { DeleteUserVersionBean } from "../bean/deleteUserVersionBean.type.ts";
import type { SetDlcDoneBean } from "../bean/setDlcDoneBean.type.ts";
import type { UpdateUserVersionBean } from "../bean/updateUserVersionBean.type.ts";
import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { checkNewUserVersion } from "../helper/checkNewUserVersion.ts";
import { loadStoredGameBean } from "../helper/loadStoredGameBean.ts";
import { loadUserGameBean } from "../helper/loadUserGameBean.ts";
import { dlcBelongsToGameQuery } from "../query/dlc/dlcBelongsToGameQuery.ts";
import { deleteDoneDlcQuery } from "../query/doneDlc/deleteDoneDlcQuery.ts";
import { insertDoneDlcQuery } from "../query/doneDlc/insertDoneDlcQuery.ts";
import { deleteUnusedSeriesQuery } from "../query/series/deleteUnusedSeriesQuery.ts";
import { deleteUserGameQuery } from "../query/userGame/deleteUserGameQuery.ts";
import { getUserGameQuery } from "../query/userGame/getUserGameQuery.ts";
import { createUserVersionQuery } from "../query/userVersion/createUserVersionQuery.ts";
import { deleteUserVersionsQuery } from "../query/userVersion/deleteUserVersionsQuery.ts";
import { getGameUserVersionsQuery } from "../query/userVersion/getGameUserVersionsQuery.ts";
import { getUserVersionQuery } from "../query/userVersion/getUserVersionQuery.ts";
import { updateUserVersionQuery } from "../query/userVersion/updateUserVersionQuery.ts";

function userVersionNotFound(id: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.USER_VERSION_NOT_FOUND,
		`No played version with id : ${id}`,
	);
}

// La version jouée du compte, verrouillée, et le jeu qui la porte ; celle d'un autre compte est absente (404)
async function lockUserVersion(
	userId: number,
	id: number,
	transaction: Transaction,
): Promise<{ gameId: number; sureFinishCount: number }> {
	const userVersion = await getUserVersionQuery(userId, id, transaction);
	if (userVersion === null) throw userVersionNotFound(id);
	return {
		gameId: userVersion.version.gameId,
		sureFinishCount: userVersion.sureFinishCount,
	};
}

class UserVersionService {
	// « Ajouter une version jouée », à un jeu déjà dans le backlog
	async createUserVersion(
		userId: number,
		{ gameId, userVersion }: CreateUserVersionBean,
	): Promise<UserGameBean> {
		await runInTransaction(
			"Failed to add played version",
			async (transaction) => {
				const userGame = await getUserGameQuery(userId, gameId, transaction);
				const game = await loadStoredGameBean(userId, gameId, transaction);
				if (userGame === null || game === null)
					throw new NotFoundError(
						BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
						`No backlog game with id : ${gameId}`,
					);
				await checkNewUserVersion(
					userId,
					game,
					userVersion,
					userGame.endingType,
					transaction,
				);
				await createUserVersionQuery(
					userId,
					{
						...userVersion,
						sureFinishCount: applyFirstFinishCount(
							userVersion.status,
							userVersion.sureFinishCount,
						),
					},
					transaction,
				);
			},
		);
		return loadUserGameBean(userId, gameId);
	}

	/**
	 * Une cellule du tableau. Un nouveau statut de fin passe « fois fini (sûr) » à 1 s'il
	 * était à 0, sauf quand la même requête fixe ce compteur : la valeur envoyée l'emporte. Quitter les statuts de fin
	 * n'efface pas la date de fin
	 */
	async updateUserVersion(
		userId: number,
		{ id, changes }: UpdateUserVersionBean,
	): Promise<UserGameBean> {
		const gameId = await runInTransaction(
			"Failed to update played version",
			async (transaction) => {
				const userVersion = await lockUserVersion(userId, id, transaction);
				const { status } = changes;
				if (status !== undefined) {
					const userGame = await getUserGameQuery(
						userId,
						userVersion.gameId,
						transaction,
					);
					if (
						userGame !== null &&
						!isStatusAllowed(status, userGame.endingType)
					)
						throw new ConflictError(
							BacklogErrorCodeEnum.STATUS_NOT_ALLOWED,
							`Status ${status} is not offered for ending type : ${userGame.endingType ?? "none"}`,
						);
				}
				await updateUserVersionQuery(
					userId,
					id,
					{
						...changes,
						...(status !== undefined &&
							changes.sureFinishCount === undefined && {
								sureFinishCount: applyFirstFinishCount(
									status,
									userVersion.sureFinishCount,
								),
							}),
					},
					transaction,
				);
				return userVersion.gameId;
			},
		);
		return loadUserGameBean(userId, gameId);
	}

	/**
	 * « Retirer la version jouée » : ses DLC faits partent avec elle. Retirer la dernière retire le jeu du backlog avec sa
	 * personnalisation, et une série créée à la main qui n'a plus de jeu
	 */
	async deleteUserVersion(
		userId: number,
		{ id }: DeleteUserVersionBean,
	): Promise<void> {
		await runInTransaction(
			"Failed to remove played version",
			async (transaction) => {
				const { gameId } = await lockUserVersion(userId, id, transaction);
				await deleteUserVersionsQuery(userId, [id], transaction);
				if (
					(await getGameUserVersionsQuery(userId, gameId, transaction)).length >
					0
				)
					return;
				await deleteUserGameQuery(userId, gameId, transaction);
				await deleteUnusedSeriesQuery(userId, transaction);
			},
		);
	}

	// Case « fait » d'un DLC du jeu sur une version jouée ; cocher deux fois ne change rien
	async setDlcDone(
		userId: number,
		{ userVersionId, dlcId, isDone }: SetDlcDoneBean,
	): Promise<UserGameBean> {
		const gameId = await runInTransaction(
			"Failed to set DLC done",
			async (transaction) => {
				// La version jouée est au compte : ses DLC faits, sans user_id, le sont aussi
				const userVersion = await lockUserVersion(
					userId,
					userVersionId,
					transaction,
				);
				if (
					!(await dlcBelongsToGameQuery(dlcId, userVersion.gameId, transaction))
				)
					throw new NotFoundError(
						BacklogErrorCodeEnum.DLC_NOT_FOUND,
						`No DLC with id ${dlcId} for game : ${userVersion.gameId}`,
					);
				if (isDone) await insertDoneDlcQuery(userVersionId, dlcId, transaction);
				else await deleteDoneDlcQuery(userVersionId, dlcId, transaction);
				return userVersion.gameId;
			},
		);
		return loadUserGameBean(userId, gameId);
	}
}

export const userVersionService = new UserVersionService();
