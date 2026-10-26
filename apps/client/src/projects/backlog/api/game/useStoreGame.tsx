import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { StoreGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameBodyDto.type";
import type { StoreGame } from "@citadel/specs/src/projects/backlog/endpoint/games/storeGame/storeGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromGamePreviewVersionDtoToStoredVersionDto } from "../cache/fromGamePreviewVersionDtoToStoredVersionDto";
import { getCachedGamePreview } from "../cache/getCachedGamePreview";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";

type Rollback = { isWritten: boolean };

/**
 * « Valider » de la modale d'ajout (cahier des charges, §8). Le jeu en base est écrit tout de suite dans le cache, depuis
 * la prévisualisation : l'ajout au backlog qui suit s'ouvre sans attendre, et sa requête attend celle-ci (même scope).
 * Seule exception à « on ne crée jamais un cache de toutes pièces » : c'est le résultat attendu d'une création
 */
export function useStoreGame(igdbId: number, gameId: number) {
	return useOptimisticMutation<StoreGame, StoreGameBodyDto, Rollback>({
		mutationKey: backlogQueryKeys.mutation("storeGame", gameId),
		scope: `game-${gameId}`,
		actionLabel: "enregistrer le jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/games`,
			method: HttpMethodEnum.POST,
			protected: false,
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.storedGames(),
			backlogQueryKeys.overview(),
			backlogQueryKeys.igdbSearches(),
			backlogQueryKeys.gamePreview(igdbId),
			backlogQueryKeys.allSeries(),
		],
		applyOptimistic: (queryClient, { versionIds, dlcIds }) => {
			shiftOverviewCounts(queryClient, { outsideBacklogGameCount: 1 });
			const preview = getCachedGamePreview(queryClient, igdbId);
			if (preview === undefined) return { isWritten: false };
			const storedGame: StoredGameDto = {
				...preview.game,
				// L'id de la série proposée n'est connu qu'une fois en base
				proposedSeries:
					preview.proposedSeriesName === null
						? null
						: { id: createTemporaryId(), name: preview.proposedSeriesName },
				developer: preview.developer,
				publisher: preview.publisher,
				versions: preview.versions
					.filter(
						({ id, isStored }) =>
							id === gameId || isStored || versionIds.includes(id),
					)
					.map(fromGamePreviewVersionDtoToStoredVersionDto),
				dlcs: preview.dlcs
					.filter(({ id, isStored }) => isStored || dlcIds.includes(id))
					.map(({ id, name }) => ({ id, name })),
				customization: null,
			};
			queryClient.setQueryData(backlogQueryKeys.storedGame(gameId), storedGame);
			return { isWritten: true };
		},
		revertOptimistic: (queryClient, _body, { isWritten }) => {
			shiftOverviewCounts(queryClient, { outsideBacklogGameCount: -1 });
			if (isWritten)
				queryClient.removeQueries({
					queryKey: backlogQueryKeys.storedGame(gameId),
					exact: true,
				});
		},
		applyServerResponse: (queryClient, storedGame) =>
			queryClient.setQueryData(backlogQueryKeys.storedGame(gameId), storedGame),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}
