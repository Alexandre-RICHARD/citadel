import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import { computeUserGameAggregates } from "@citadel/specs/src/projects/backlog/rule/aggregate/computeUserGameAggregates";
import { countDoneDlcs } from "@citadel/specs/src/projects/backlog/rule/aggregate/countDoneDlcs";

import { isTemporaryId } from "../../../../common/api/mutation/isTemporaryId";
import type { BacklogRowFm } from "./backlogRowFm.type";
import type { UserVersionRowFm } from "./userVersionRowFm.type";

/**
 * Une ligne du backlog, agrégats compris : la même règle que le serveur (rule/aggregate), recalculée ici pour qu'une
 * modification optimiste d'une version jouée mette tout de suite la ligne du jeu à jour
 */
export function fromUserGameDtoToBacklogRowFm(
	userGame: UserGameDto,
): BacklogRowFm {
	const dlcIds = userGame.dlcs.map(({ id }) => id);
	const userVersionRows = userGame.userVersions.map(
		(userVersion): UserVersionRowFm => ({
			userVersionId: userVersion.id,
			versionId: userVersion.version.id,
			coverImageId: userVersion.version.coverImageId,
			versionTitle: userVersion.version.title,
			releaseDate: userVersion.releaseDate,
			platform: userVersion.platform,
			status: userVersion.status,
			isOwned: userVersion.isOwned,
			isUpNext: userVersion.isUpNext,
			finishDate: userVersion.finishDate,
			sureFinishCount: userVersion.sureFinishCount,
			probableFinishCount: userVersion.probableFinishCount,
			doneDlcIds: userVersion.doneDlcIds,
			doneDlcCount: countDoneDlcs(userVersion.doneDlcIds, dlcIds),
			dlcCount: dlcIds.length,
			trackedPlayTimeMinutes: userVersion.trackedPlayTimeMinutes,
			estimatedPlayTimeMinutes: userVersion.estimatedPlayTimeMinutes,
			totalPlayTimeMinutes:
				userVersion.trackedPlayTimeMinutes +
				userVersion.estimatedPlayTimeMinutes,
			rating: userVersion.rating,
			comment: userVersion.comment,
			igdbUrl: userVersion.version.igdbUrl,
			isTemporary: isTemporaryId(userVersion.id),
		}),
	);
	const singleRow =
		userVersionRows.length === 1 ? (userVersionRows.at(0) ?? null) : null;

	return {
		...computeUserGameAggregates(userGame.userVersions, dlcIds),
		gameId: userGame.game.id,
		imageId: userGame.imageId,
		name: userGame.game.name,
		frenchName: userGame.game.frenchName,
		versionTitle: singleRow?.versionTitle ?? null,
		series: userGame.series,
		proposedSeries: userGame.game.proposedSeries,
		seriesNumber: userGame.seriesNumber,
		seriesNumberLabel: userGame.seriesNumberLabel,
		developer: userGame.game.developer,
		publisher: userGame.game.publisher,
		releaseDate: userGame.game.firstReleaseDate,
		isCancelled: userGame.game.isCancelled,
		endingType: userGame.endingType,
		platform: singleRow?.platform ?? null,
		igdbUrl: userGame.game.igdbUrl,
		dlcs: userGame.dlcs,
		userVersionRows,
		isTemporary:
			userVersionRows.length > 0 &&
			userVersionRows.every(({ isTemporary }) => isTemporary),
	};
}
