import type { GamePreviewDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewDto.type.ts";

import type { GamePreviewBean } from "../../../bean/gamePreviewBean.type.ts";

// Même forme : chaque champ est recopié, pour qu'un ajout au bean ne fuite pas dans l'API sans le décider
export function fromGamePreviewBeanToGamePreviewDto(
	preview: GamePreviewBean,
): GamePreviewDto {
	return {
		game: { ...preview.game },
		isStored: preview.isStored,
		proposedSeriesName: preview.proposedSeriesName,
		developer: preview.developer,
		publisher: preview.publisher,
		versions: preview.versions.map((version) => ({
			id: version.id,
			title: version.title,
			coverImageId: version.coverImageId,
			igdbUrl: version.igdbUrl,
			isStored: version.isStored,
			platforms: version.platforms,
			platformOptions: version.platformOptions,
		})),
		dlcs: preview.dlcs.map((dlc) => ({
			id: dlc.id,
			name: dlc.name,
			isStored: dlc.isStored,
			storedGameId: dlc.storedGameId,
		})),
		imageIds: preview.imageIds,
		warnings: preview.warnings.map((warning) => ({
			igdbId: warning.igdbId,
			name: warning.name,
			typeName: warning.typeName,
			entryJson: warning.entryJson,
		})),
	};
}
