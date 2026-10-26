import type { GamePreviewDto } from "@citadel/specs/src/projects/backlog/dto/igdb/gamePreviewDto.type";

import type { GamePreviewFm } from "./gamePreviewFm.type";

export function fromGamePreviewDtoToGamePreviewFm(
	preview: GamePreviewDto,
): GamePreviewFm {
	return {
		game: { ...preview.game },
		isStored: preview.isStored,
		proposedSeriesName: preview.proposedSeriesName,
		developer: preview.developer,
		publisher: preview.publisher,
		versions: preview.versions.map((version) => ({
			...version,
			isOriginal: version.id === preview.game.id,
		})),
		dlcs: preview.dlcs.map((dlc) => ({ ...dlc })),
		imageIds: preview.imageIds,
		warnings: preview.warnings.map(({ igdbId, name, typeName, entryJson }) => ({
			igdbId,
			message: `« ${name} » est rattaché comme version, mais son type est « ${typeName} » : fiche ignorée.`,
			entryJson,
		})),
	};
}
