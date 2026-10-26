import type { StoredVersionDto } from "@citadel/specs/src/projects/backlog/dto/game/storedVersionDto.type";
import type { GamePreviewVersionDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewVersionDto.type";

// Une version de la prévisualisation telle que le serveur l'enregistrera, pour l'écrire dans le jeu en cache
export function fromGamePreviewVersionDtoToStoredVersionDto(
	version: GamePreviewVersionDto,
): StoredVersionDto {
	return {
		id: version.id,
		title: version.title,
		coverImageId: version.coverImageId,
		igdbUrl: version.igdbUrl,
		platforms: version.platforms,
		platformOptions: version.platformOptions,
	};
}
