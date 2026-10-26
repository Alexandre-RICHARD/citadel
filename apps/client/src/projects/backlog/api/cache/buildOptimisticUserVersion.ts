import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";
import type { UserVersionDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userVersionDto.type";
import type { CreateUserVersionBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodyDto.type";
import { applyFirstFinishCount } from "@citadel/specs/src/projects/backlog/rule/status/applyFirstFinishCount";

/**
 * La version jouée telle que le serveur la créera, à partir du jeu en cache : sa version, sa plateforme et la date de
 * sortie (pour un émulateur, celle de la console émulée). null si le jeu n'en sait pas assez : pas d'affichage optimiste
 */
export function buildOptimisticUserVersion(
	storedGame: StoredGameDto,
	body: CreateUserVersionBodyDto,
	temporaryId: number,
): UserVersionDto | null {
	const version = storedGame.versions.find(({ id }) => id === body.versionId);
	const platform = version?.platformOptions.find(
		({ id }) => id === body.platformId,
	);
	if (version === undefined || platform === undefined) return null;

	const releasePlatformId = platform.emulatedPlatformId ?? platform.id;
	return {
		id: temporaryId,
		version: {
			id: version.id,
			title: version.title,
			coverImageId: version.coverImageId,
			igdbUrl: version.igdbUrl,
		},
		platform,
		releaseDate:
			version.platforms.find(
				(versionPlatform) => versionPlatform.platform.id === releasePlatformId,
			)?.releaseDate ?? null,
		status: body.status,
		isOwned: body.isOwned,
		isUpNext: body.isUpNext,
		finishDate: body.finishDate,
		sureFinishCount: applyFirstFinishCount(body.status, body.sureFinishCount),
		probableFinishCount: body.probableFinishCount,
		trackedPlayTimeMinutes: body.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: body.estimatedPlayTimeMinutes,
		rating: body.rating,
		comment: body.comment,
		doneDlcIds: body.doneDlcIds,
	};
}
