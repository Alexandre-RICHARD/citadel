import type { CreateUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodyDto.type";
import type { CreateUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameEndpoint.interface";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { buildOptimisticUserVersion } from "../cache/buildOptimisticUserVersion";
import { getCachedAllSeries } from "../cache/getCachedAllSeries";
import { getCachedSeriesEntries } from "../cache/getCachedSeriesEntries";
import { getCachedStoredGame } from "../cache/getCachedStoredGame";
import { insertCachedUserGame } from "../cache/insertCachedUserGame";
import { removeCachedUserGame } from "../cache/removeCachedUserGame";
import { resolveOptimisticSeries } from "../cache/resolveOptimisticSeries";
import { shiftOverviewCounts } from "../cache/shiftOverviewCounts";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = { isInserted: boolean };

/**
 * Ajout au backlog : la personnalisation et la première version jouée. La ligne apparaît en
 * tête du tableau, grisée, construite depuis le jeu en cache ; le serveur range ensuite le numéro dans la série.
 * Même scope que l'enregistrement du jeu : si le jeu vient d'être ajouté, sa requête attend la sienne
 */
export function useCreateUserGame(gameId: number) {
	return useOptimisticMutation<CreateUserGame, CreateUserGameBodyDto, Rollback>(
		{
			mutationKey: backlogQueryKeys.mutation("createUserGame", gameId),
			scope: `game-${gameId}`,
			actionLabel: "ajouter le jeu au backlog",
			buildRequest: (body) => ({
				url: `${ApiPrefixEnum.BACKLOG}/user-games`,
				method: HttpMethodEnum.POST,
				protected: false,
				body,
			}),
			getAffectedQueryKeys: () => [
				backlogQueryKeys.userGames(),
				backlogQueryKeys.overview(),
				backlogQueryKeys.storedGames(),
				backlogQueryKeys.storedGame(gameId),
				backlogQueryKeys.allSeries(),
				backlogQueryKeys.seriesEntriesOfAll(),
				backlogQueryKeys.igdbSearches(),
			],
			applyOptimistic: (queryClient, body) => {
				shiftOverviewCounts(queryClient, {
					gameCount: 1,
					userVersionCount: 1,
					outsideBacklogGameCount: -1,
				});
				const storedGame = getCachedStoredGame(queryClient, gameId);
				const userVersion =
					storedGame === undefined
						? null
						: buildOptimisticUserVersion(
								storedGame,
								body.userVersion,
								createTemporaryId(),
							);
				if (storedGame === undefined || userVersion === null)
					return { isInserted: false };

				const { customization } = body;
				const series = resolveOptimisticSeries(
					customization.series,
					storedGame.proposedSeries,
					getCachedAllSeries(queryClient),
					createTemporaryId(),
				);
				const seriesNumber =
					series === null ? null : customization.seriesNumber;
				insertCachedUserGame(queryClient, {
					game: {
						id: storedGame.id,
						name: storedGame.name,
						frenchName: storedGame.frenchName,
						firstReleaseDate: storedGame.firstReleaseDate,
						isCancelled: storedGame.isCancelled,
						igdbUrl: storedGame.igdbUrl,
						developer: storedGame.developer,
						publisher: storedGame.publisher,
						proposedSeries: storedGame.proposedSeries,
					},
					imageId: customization.imageId,
					endingType: customization.endingType,
					series,
					seriesNumber,
					seriesNumberLabel:
						series === null || seriesNumber === null
							? null
							: formatSeriesNumber(
									seriesNumber,
									getCachedSeriesEntries(queryClient, series.id),
								),
					dlcs: storedGame.dlcs,
					userVersions: [userVersion],
				});
				return { isInserted: true };
			},
			revertOptimistic: (queryClient, _body, { isInserted }) => {
				shiftOverviewCounts(queryClient, {
					gameCount: -1,
					userVersionCount: -1,
					outsideBacklogGameCount: 1,
				});
				if (isInserted) removeCachedUserGame(queryClient, gameId);
			},
			applyServerResponse: (queryClient, userGame, _body, { isInserted }) => {
				if (isInserted)
					updateCachedUserGame(queryClient, gameId, () => userGame);
				else insertCachedUserGame(queryClient, userGame);
			},
			errorReasons: backlogErrorReasons,
			fieldLabels: backlogFieldLabels,
		},
	);
}
