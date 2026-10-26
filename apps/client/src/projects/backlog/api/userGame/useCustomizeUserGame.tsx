import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { CustomizeUserGameBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameBodyDto.type";
import type { CustomizeUserGame } from "@citadel/specs/src/projects/backlog/endpoint/userGames/customizeUserGame/customizeUserGameEndpoint.interface";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber";
import { convertStatus } from "@citadel/specs/src/projects/backlog/rule/status/convertStatus";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { findCachedUserGame } from "../cache/findCachedUserGame";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { getCachedAllSeries } from "../cache/getCachedAllSeries";
import { getCachedSeriesEntries } from "../cache/getCachedSeriesEntries";
import { resolveOptimisticSeries } from "../cache/resolveOptimisticSeries";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Customization = Pick<
	UserGameDto,
	"imageId" | "endingType" | "series" | "seriesNumber" | "seriesNumberLabel"
>;
type Rollback = {
	customization: Customization;
	statuses: Map<number, UserGameDto["userVersions"][number]["status"]>;
} | null;

/**
 * « Personnaliser » : la ligne change tout de suite, statuts convertis compris ; les numéros
 * des autres jeux de la série, que le serveur décale, se resynchronisent après
 */
export function useCustomizeUserGame(gameId: number) {
	return useOptimisticMutation<
		CustomizeUserGame,
		CustomizeUserGameBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("customizeUserGame", gameId),
		scope: `game-${gameId}`,
		actionLabel: "personnaliser le jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-games/:gameId`,
			method: HttpMethodEnum.PUT,
			protected: false,
			pathParams: { gameId },
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userGames(),
			backlogQueryKeys.storedGame(gameId),
			backlogQueryKeys.allSeries(),
			backlogQueryKeys.seriesEntriesOfAll(),
		],
		applyOptimistic: (queryClient, body) => {
			const current = findCachedUserGame(queryClient, gameId);
			if (current === undefined) return null;
			const series = resolveOptimisticSeries(
				body.series,
				current.game.proposedSeries,
				getCachedAllSeries(queryClient),
				createTemporaryId(),
			);
			const seriesNumber =
				series === null ? null : (body.seriesNumber ?? current.seriesNumber);
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				imageId: body.imageId,
				endingType: body.endingType,
				series,
				seriesNumber,
				seriesNumberLabel:
					series === null || seriesNumber === null
						? null
						: formatSeriesNumber(
								seriesNumber,
								getCachedSeriesEntries(queryClient, series.id),
							),
				userVersions: userGame.userVersions.map((userVersion) => ({
					...userVersion,
					status: convertStatus(userVersion.status, body.endingType),
				})),
			}));
			return {
				customization: {
					imageId: current.imageId,
					endingType: current.endingType,
					series: current.series,
					seriesNumber: current.seriesNumber,
					seriesNumberLabel: current.seriesNumberLabel,
				},
				statuses: new Map(
					current.userVersions.map(({ id, status }) => [id, status]),
				),
			};
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			if (rollback === null) return;
			updateCachedUserGame(queryClient, gameId, (userGame) => ({
				...userGame,
				...rollback.customization,
				userVersions: userGame.userVersions.map((userVersion) => ({
					...userVersion,
					status: rollback.statuses.get(userVersion.id) ?? userVersion.status,
				})),
			}));
		},
		applyServerResponse: (queryClient, userGame) =>
			updateCachedUserGame(queryClient, gameId, () => userGame),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}
