import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum.ts";

import { NotFoundError } from "../../../error/NotFoundError.ts";
import type { GamePreviewBean } from "../bean/gamePreviewBean.type.ts";
import type { GetGameImagesBean } from "../bean/getGameImagesBean.type.ts";
import type { GetGamePreviewBean } from "../bean/getGamePreviewBean.type.ts";
import type { SearchIgdbGamesBean } from "../bean/searchIgdbGamesBean.type.ts";
import type { SearchResultBean } from "../bean/searchResultBean.type.ts";
import { buildGamePreview } from "../helper/buildGamePreview.ts";
import { loadStoredGameBean } from "../helper/loadStoredGameBean.ts";
import { igdbGateway } from "../igdb/igdbGateway.ts";
import { fromPlatformEntityToPlatformBean } from "../mapper/beanEntity/fromPlatformEntityToPlatformBean.ts";
import { fromIgdbGameDataToGameImportBean } from "../mapper/igdbBean/fromIgdbGameDataToGameImportBean.ts";
import { fromIgdbGameImagesToImageIds } from "../mapper/igdbBean/fromIgdbGameImagesToImageIds.ts";
import { fromIgdbSearchHitToSearchResultBean } from "../mapper/igdbBean/fromIgdbSearchHitToSearchResultBean.ts";
import { getEmulatorsQuery } from "../query/platform/getEmulatorsQuery.ts";
import { getStoredVersionsQuery } from "../query/version/getStoredVersionsQuery.ts";

function igdbGameNotFound(igdbId: number): NotFoundError {
	return new NotFoundError(
		BacklogErrorCodeEnum.IGDB_GAME_NOT_FOUND,
		`No IGDB game with id : ${igdbId}`,
	);
}

class IgdbService {
	// Un résultat déjà en base est signalé (cahier des charges, §8) : il mène à l'ajout au backlog, pas à la modale d'ajout
	async searchGames({
		query,
	}: SearchIgdbGamesBean): Promise<SearchResultBean[]> {
		const results = (await igdbGateway.searchGames(query)).map(
			fromIgdbSearchHitToSearchResultBean,
		);
		const storedVersions = new Map(
			(await getStoredVersionsQuery(results.map(({ igdbId }) => igdbId))).map(
				(row) => [row.id, row],
			),
		);
		return results.map((result) => {
			const stored = storedVersions.get(result.igdbId);
			return {
				...result,
				storedGameId: stored?.gameId ?? null,
				isInBacklog: Boolean(stored?.isInBacklog),
			};
		});
	}

	/**
	 * Le jeu en base est celui de la première fiche de l'arbre qui y est déjà : la fiche demandée, son original, puis
	 * ses versions. Un jeu dont IGDB a changé l'original (FF7) se retrouve ainsi quand même
	 */
	async getGamePreview({
		igdbId,
	}: GetGamePreviewBean): Promise<GamePreviewBean> {
		const data = await igdbGateway.fetchGameData(igdbId);
		if (data === null) throw igdbGameNotFound(igdbId);

		const gameImport = fromIgdbGameDataToGameImportBean(data);
		const treeIds = [
			igdbId,
			gameImport.game.id,
			...gameImport.versions.map(({ id }) => id),
		];
		const dlcIds = gameImport.dlcs.map(({ id }) => id);
		const [storedVersions, emulators] = await Promise.all([
			getStoredVersionsQuery([...new Set([...treeIds, ...dlcIds])]),
			getEmulatorsQuery(),
		]);
		const storedGameId =
			treeIds
				.map((id) => storedVersions.find((row) => row.id === id)?.gameId)
				.find((gameId) => gameId !== undefined) ?? null;

		return buildGamePreview({
			gameImport,
			storedGame:
				storedGameId === null ? null : await loadStoredGameBean(storedGameId),
			dlcGameIds: new Map(
				storedVersions
					.filter(({ id }) => dlcIds.includes(id))
					.map(({ id, gameId }) => [id, gameId]),
			),
			emulators: emulators.map(fromPlatformEntityToPlatformBean),
		});
	}

	async getGameImages({ igdbId }: GetGameImagesBean): Promise<string[]> {
		const images = await igdbGateway.fetchGameImages(igdbId);
		if (images === null) throw igdbGameNotFound(igdbId);
		return fromIgdbGameImagesToImageIds(images);
	}
}

export const igdbService = new IgdbService();
