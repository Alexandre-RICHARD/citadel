import type { ImportGameContentBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentBodyDto.type";
import type { ImportGameContent } from "@citadel/specs/src/projects/backlog/endpoint/games/importGameContent/importGameContentEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { fromGamePreviewVersionDtoToStoredVersionDto } from "../cache/fromGamePreviewVersionDtoToStoredVersionDto";
import { getCachedGamePreview } from "../cache/getCachedGamePreview";
import { updateCachedStoredGame } from "../cache/updateCachedStoredGame";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = { dlcIds: number[]; versionIds: number[] };

/**
 * « Modifier le jeu » et « Rechercher d'autres DLC » : les DLC ajoutés comptent tout de
 * suite dans « faits / total » de la ligne du jeu
 */
export function useImportGameContent(gameId: number) {
	return useOptimisticMutation<
		ImportGameContent,
		ImportGameContentBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("importGameContent", gameId),
		scope: `game-${gameId}`,
		actionLabel: "compléter le jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/games/:gameId/imports`,
			method: HttpMethodEnum.POST,
			protected: false,
			pathParams: { gameId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.storedGame(gameId),
			backlogQueryKeys.gamePreview(gameId),
		],
		applyOptimistic: (queryClient, { versionIds, dlcIds }) => {
			const preview = getCachedGamePreview(queryClient, gameId);
			const addedDlcs = (preview?.dlcs ?? [])
				.filter(({ id, isStored }) => !isStored && dlcIds.includes(id))
				.map(({ id, name }) => ({ id, name }));
			const addedVersions = (preview?.versions ?? [])
				.filter(({ id, isStored }) => !isStored && versionIds.includes(id))
				.map(fromGamePreviewVersionDtoToStoredVersionDto);
			updateCachedStoredGame(queryClient, gameId, (game) => ({
				...game,
				versions: [...game.versions, ...addedVersions],
				dlcs: [...game.dlcs, ...addedDlcs],
			}));
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				dlcs: [...userGame.dlcs, ...addedDlcs],
			}));
			return {
				dlcIds: addedDlcs.map(({ id }) => id),
				versionIds: addedVersions.map(({ id }) => id),
			};
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			updateCachedStoredGame(queryClient, gameId, (game) => ({
				...game,
				versions: game.versions.filter(
					({ id }) => !rollback.versionIds.includes(id),
				),
				dlcs: game.dlcs.filter(({ id }) => !rollback.dlcIds.includes(id)),
			}));
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				dlcs: userGame.dlcs.filter(({ id }) => !rollback.dlcIds.includes(id)),
			}));
		},
		applyServerResponse: (queryClient, storedGame) =>
			queryClient.setQueryData(backlogQueryKeys.storedGame(gameId), storedGame),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}
