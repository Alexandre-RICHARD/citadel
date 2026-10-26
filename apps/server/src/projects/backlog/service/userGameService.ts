import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { applyFirstFinishCount } from "@citadel/specs/src/projects/backlog/rule/status/applyFirstFinishCount.ts";
import { convertStatus } from "@citadel/specs/src/projects/backlog/rule/status/convertStatus.ts";
import { BacklogPageSizeEnum } from "@citadel/specs/src/projects/backlog/rule/view/backlogPageSize.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { CreateUserGameBean } from "../bean/createUserGameBean.type.ts";
import type { CustomizationInputBean } from "../bean/customizationInputBean.type.ts";
import type { CustomizeUserGameBean } from "../bean/customizeUserGameBean.type.ts";
import type { DeleteUserGameBean } from "../bean/deleteUserGameBean.type.ts";
import type { GetUserGamesBean } from "../bean/getUserGamesBean.type.ts";
import type { UserGameBean } from "../bean/userGameBean.type.ts";
import type { UserGamePageBean } from "../bean/userGamePageBean.type.ts";
import { checkNewUserVersion } from "../helper/checkNewUserVersion.ts";
import { loadStoredGameBean } from "../helper/loadStoredGameBean.ts";
import { loadUserGameBean } from "../helper/loadUserGameBean.ts";
import { loadUserGameBeans } from "../helper/loadUserGameBeans.ts";
import { resolveSeriesPlacement } from "../helper/resolveSeriesPlacement.ts";
import { deleteUnusedSeriesQuery } from "../query/series/deleteUnusedSeriesQuery.ts";
import { updateSeriesNumbersQuery } from "../query/series/updateSeriesNumbersQuery.ts";
import { createUserGameQuery } from "../query/userGame/createUserGameQuery.ts";
import { deleteUserGameQuery } from "../query/userGame/deleteUserGameQuery.ts";
import { getUserGameQuery } from "../query/userGame/getUserGameQuery.ts";
import { updateUserGameQuery } from "../query/userGame/updateUserGameQuery.ts";
import { createUserVersionQuery } from "../query/userVersion/createUserVersionQuery.ts";
import { deleteUserVersionsQuery } from "../query/userVersion/deleteUserVersionsQuery.ts";
import { getGameUserVersionsQuery } from "../query/userVersion/getGameUserVersionsQuery.ts";
import { updateUserVersionQuery } from "../query/userVersion/updateUserVersionQuery.ts";
import { buildUserGameView } from "../view/buildUserGameView.ts";
import { filterUserGameViews } from "../view/filterUserGameViews.ts";
import { sortUserGameViews } from "../view/sortUserGameViews.ts";

function userGameNotFound(gameId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.USER_GAME_NOT_FOUND,
		`No backlog game with id : ${gameId}`,
	);
}

// Range le jeu dans sa série et écrit sa personnalisation ; les jeux que son numéro décale avancent
async function saveCustomization(
	gameId: number,
	proposedSeriesId: number | null,
	customization: CustomizationInputBean,
	isNew: boolean,
	transaction: Transaction,
): Promise<void> {
	const { seriesId, seriesNumber, shiftedEntries } =
		await resolveSeriesPlacement(
			gameId,
			proposedSeriesId,
			customization,
			transaction,
		);
	await updateSeriesNumbersQuery(shiftedEntries, transaction);
	const saved = {
		imageId: customization.imageId,
		endingType: customization.endingType,
		seriesId,
		seriesNumber,
	};
	if (isNew) await createUserGameQuery({ gameId, ...saved }, transaction);
	else await updateUserGameQuery(gameId, saved, transaction);
}

class UserGameService {
	/**
	 * Le tableau : tout le backlog est lu, chaque ligne calculée, filtrée et triée, puis découpée
	 * en pages de 25. Quelques milliers de jeux tiennent largement en mémoire
	 */
	async getUserGames({
		page,
		sort,
		filters,
	}: GetUserGamesBean): Promise<UserGamePageBean> {
		const pageSize = Number(BacklogPageSizeEnum.USER_GAMES);
		const views = sortUserGameViews(
			filterUserGameViews(
				(await loadUserGameBeans(null)).map(buildUserGameView),
				filters,
			),
			sort,
		);
		return {
			userGames: views
				.slice((page - 1) * pageSize, page * pageSize)
				.map(({ userGame }) => userGame),
			matchedCount: views.length,
		};
	}

	/**
	 * Ajout au backlog : la personnalisation et la première version jouée, en une seule action.
	 * Un statut de rang 5 ou plus passe « fois fini (sûr) » à 1 s'il est à 0
	 */
	async createUserGame({
		gameId,
		customization,
		userVersion,
	}: CreateUserGameBean): Promise<UserGameBean> {
		await runInTransaction(
			"Failed to add game to the backlog",
			async (transaction) => {
				const game = await loadStoredGameBean(gameId, transaction);
				if (game === null)
					throw new NotFoundError(
						BacklogErrorCodeEnum.GAME_NOT_FOUND,
						`No game with id : ${gameId}`,
					);
				if ((await getUserGameQuery(gameId, transaction)) !== null)
					throw new ConflictError(
						BacklogErrorCodeEnum.USER_GAME_ALREADY_EXISTS,
						`Game already in the backlog : ${gameId}`,
					);
				await checkNewUserVersion(
					game,
					userVersion,
					customization.endingType,
					transaction,
				);

				await saveCustomization(
					gameId,
					game.proposedSeries?.id ?? null,
					customization,
					true,
					transaction,
				);
				await createUserVersionQuery(
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
		return loadUserGameBean(gameId);
	}

	/**
	 * « Personnaliser » : image, type de fin, série et numéro. Les statuts que le nouveau type de fin
	 * rend incompatibles sont convertis ; une série qui n'a plus de raison d'être quitte la base
	 */
	async customizeUserGame({
		gameId,
		customization,
	}: CustomizeUserGameBean): Promise<UserGameBean> {
		await runInTransaction(
			"Failed to customize backlog game",
			async (transaction) => {
				if ((await getUserGameQuery(gameId, transaction)) === null)
					throw userGameNotFound(gameId);
				const game = await loadStoredGameBean(gameId, transaction);

				await saveCustomization(
					gameId,
					game?.proposedSeries?.id ?? null,
					customization,
					false,
					transaction,
				);
				const userVersions = await getGameUserVersionsQuery(
					gameId,
					transaction,
				);
				await Promise.all(
					userVersions.map(async ({ id, status }) => {
						const converted = convertStatus(status, customization.endingType);
						if (converted === status) return;
						await updateUserVersionQuery(
							id,
							{ status: converted },
							transaction,
						);
					}),
				);
				await deleteUnusedSeriesQuery(transaction);
			},
		);
		return loadUserGameBean(gameId);
	}

	// « Retirer le jeu du backlog » : ses versions jouées et sa personnalisation ; le jeu reste en base
	async deleteUserGame({ gameId }: DeleteUserGameBean): Promise<void> {
		await runInTransaction(
			"Failed to remove game from the backlog",
			async (transaction) => {
				if ((await getUserGameQuery(gameId, transaction)) === null)
					throw userGameNotFound(gameId);
				const userVersions = await getGameUserVersionsQuery(
					gameId,
					transaction,
				);
				await deleteUserVersionsQuery(
					userVersions.map(({ id }) => id),
					transaction,
				);
				await deleteUserGameQuery(gameId, transaction);
				await deleteUnusedSeriesQuery(transaction);
			},
		);
	}
}

export const userGameService = new UserGameService();
