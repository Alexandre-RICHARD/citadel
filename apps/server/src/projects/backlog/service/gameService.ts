import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";
import { BacklogPageSizeEnum } from "@citadel/specs/src/projects/backlog/rule/view/backlogPageSize.enum.ts";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import { ConflictError } from "../../../error/ConflictError.ts";
import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { GameImportBean } from "../bean/gameImportBean.type.ts";
import type { GetStoredGameBean } from "../bean/getStoredGameBean.type.ts";
import type { GetStoredGamesBean } from "../bean/getStoredGamesBean.type.ts";
import type { ImportGameContentBean } from "../bean/importGameContentBean.type.ts";
import type { StoredGameBean } from "../bean/storedGameBean.type.ts";
import type { StoredGamePageBean } from "../bean/storedGamePageBean.type.ts";
import type { StoreGameBean } from "../bean/storeGameBean.type.ts";
import { loadStoredGameBean } from "../helper/loadStoredGameBean.ts";
import { igdbGateway } from "../igdb/igdbGateway.ts";
import { fromOutsideBacklogGameRowToStoredGameSummaryBean } from "../mapper/beanEntity/fromOutsideBacklogGameRowToStoredGameSummaryBean.ts";
import { fromIgdbGameDataToGameImportBean } from "../mapper/igdbBean/fromIgdbGameDataToGameImportBean.ts";
import { insertCompaniesQuery } from "../query/company/insertCompaniesQuery.ts";
import { insertDlcsQuery } from "../query/dlc/insertDlcsQuery.ts";
import { countOutsideBacklogGamesQuery } from "../query/game/countOutsideBacklogGamesQuery.ts";
import { createGameQuery } from "../query/game/createGameQuery.ts";
import { gameExistsQuery } from "../query/game/gameExistsQuery.ts";
import { getGamesPlatformNamesQuery } from "../query/game/getGamesPlatformNamesQuery.ts";
import { getOutsideBacklogGamesQuery } from "../query/game/getOutsideBacklogGamesQuery.ts";
import { insertPlatformsQuery } from "../query/platform/insertPlatformsQuery.ts";
import { findOrCreateProposedSeriesQuery } from "../query/series/findOrCreateProposedSeriesQuery.ts";
import { insertVersionsQuery } from "../query/version/insertVersionsQuery.ts";

function gameNotFound(gameId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.GAME_NOT_FOUND,
		`No game with id : ${gameId}`,
	);
}

// La fiche IGDB, relue depuis le cache de la prévisualisation : le front ne fournit jamais les données IGDB
async function fetchGameImport(igdbId: number): Promise<GameImportBean> {
	const data = await igdbGateway.fetchGameData(igdbId);
	if (data === null)
		throw new NotFoundError(
			BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND,
			`No IGDB game with id : ${igdbId}`,
		);
	return fromIgdbGameDataToGameImportBean(data);
}

// Les versions et DLC cochés doivent venir de la fiche IGDB : sinon, IGDB a changé depuis l'ouverture de la modale
function pickSelection(
	gameImport: GameImportBean,
	versionIds: number[],
	dlcIds: number[],
): Pick<GameImportBean, "versions" | "dlcs"> {
	const missingVersionId = versionIds.find(
		(id) => !gameImport.versions.some((version) => version.id === id),
	);
	if (missingVersionId !== undefined)
		throw new NotFoundError(
			BacklogErrorCodeEnum.VERSION_NOT_FOUND,
			`No version with id ${missingVersionId} in IGDB game : ${gameImport.game.id}`,
		);
	const missingDlcId = dlcIds.find(
		(id) => !gameImport.dlcs.some((dlc) => dlc.id === id),
	);
	if (missingDlcId !== undefined)
		throw new NotFoundError(
			BacklogErrorCodeEnum.DLC_NOT_FOUND,
			`No DLC with id ${missingDlcId} in IGDB game : ${gameImport.game.id}`,
		);

	return {
		versions: gameImport.versions.filter(({ id }) => versionIds.includes(id)),
		dlcs: gameImport.dlcs.filter(({ id }) => dlcIds.includes(id)),
	};
}

class GameService {
	async getStoredGame({ gameId }: GetStoredGameBean): Promise<StoredGameBean> {
		const game = await loadStoredGameBean(gameId);
		if (game === null) throw gameNotFound(gameId);
		return game;
	}

	async getStoredGames({
		query,
		page,
	}: GetStoredGamesBean): Promise<StoredGamePageBean> {
		const pageSize = Number(BacklogPageSizeEnum.STORED_GAMES);
		const [totalCount, rows] = await Promise.all([
			countOutsideBacklogGamesQuery(query),
			getOutsideBacklogGamesQuery(query, (page - 1) * pageSize, pageSize),
		]);
		const platformRows = await getGamesPlatformNamesQuery(
			rows.map(({ id }) => id),
		);
		return {
			games: rows.map((row) =>
				fromOutsideBacklogGameRowToStoredGameSummaryBean(
					row,
					platformRows
						.filter(({ gameId }) => gameId === row.id)
						.map(({ shortName }) => shortName),
				),
			),
			totalCount,
		};
	}

	/**
	 * « Valider » de la modale d'ajout (cahier des charges, §8) : le jeu, sa version originale, toujours, les versions et DLC
	 * cochés, la série proposée par IGDB, les sociétés et plateformes qui manquent. L'ajout au backlog suit, à part
	 */
	async storeGame({
		igdbId,
		versionIds,
		dlcIds,
	}: StoreGameBean): Promise<StoredGameBean> {
		const gameImport = await fetchGameImport(igdbId);
		const gameId = gameImport.game.id;
		const selection = pickSelection(gameImport, versionIds, dlcIds);
		const versions = gameImport.versions.filter(
			({ id }) =>
				id === gameId ||
				selection.versions.some((version) => version.id === id),
		);

		await runInTransaction("Failed to store game", async (transaction) => {
			if (await gameExistsQuery(gameId, transaction))
				throw new ConflictError(
					BacklogErrorCodeEnum.GAME_ALREADY_STORED,
					`Game already stored : ${gameId}`,
				);

			const { developer, publisher, proposedSeries } = gameImport;
			await insertCompaniesQuery(
				[developer, publisher].flatMap((company) => company ?? []),
				transaction,
			);
			await insertPlatformsQuery(
				versions.flatMap(({ platforms }) =>
					platforms.map(({ platform }) => platform),
				),
				transaction,
			);
			await createGameQuery(
				{
					...gameImport.game,
					proposedSeriesId:
						proposedSeries === null
							? null
							: await findOrCreateProposedSeriesQuery(
									proposedSeries,
									transaction,
								),
					developerId: developer?.id ?? null,
					publisherId: publisher?.id ?? null,
				},
				transaction,
			);
			await insertVersionsQuery(gameId, versions, transaction);
			await insertDlcsQuery(gameId, selection.dlcs, transaction);
		});

		return this.getStoredGame({ gameId });
	}

	/**
	 * « Modifier le jeu » et « Rechercher d'autres DLC » (cahier des charges, §8 et §9) : des versions et DLC IGDB rejoignent
	 * le jeu ; ceux déjà en base sont ignorés, et rien n'est retiré
	 */
	async importGameContent({
		gameId,
		versionIds,
		dlcIds,
	}: ImportGameContentBean): Promise<StoredGameBean> {
		if (!(await gameExistsQuery(gameId))) throw gameNotFound(gameId);

		const gameImport = await fetchGameImport(gameId);
		const { versions, dlcs } = pickSelection(gameImport, versionIds, dlcIds);

		await runInTransaction(
			"Failed to import game content",
			async (transaction) => {
				await insertPlatformsQuery(
					versions.flatMap(({ platforms }) =>
						platforms.map(({ platform }) => platform),
					),
					transaction,
				);
				await insertVersionsQuery(gameId, versions, transaction);
				await insertDlcsQuery(gameId, dlcs, transaction);
			},
		);

		return this.getStoredGame({ gameId });
	}
}

export const gameService = new GameService();
