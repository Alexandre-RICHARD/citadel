import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type.ts";

import type { StoredGameBean } from "../../../bean/storedGameBean.type.ts";

export function fromStoredGameBeanToStoredGameDto(
	game: StoredGameBean,
): StoredGameDto {
	return {
		id: game.id,
		name: game.name,
		frenchName: game.frenchName,
		firstReleaseDate: game.firstReleaseDate,
		isCancelled: game.isCancelled,
		igdbUrl: game.igdbUrl,
		proposedSeries: game.proposedSeries,
		developer: game.developer,
		publisher: game.publisher,
		versions: game.versions.map((version) => ({
			id: version.id,
			title: version.title,
			coverImageId: version.coverImageId,
			igdbUrl: version.igdbUrl,
			platforms: version.platforms,
			platformOptions: version.platformOptions,
		})),
		dlcs: game.dlcs,
		customization: game.customization,
	};
}
