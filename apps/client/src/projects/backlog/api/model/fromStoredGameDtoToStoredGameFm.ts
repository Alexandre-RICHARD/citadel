import type { StoredGameDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameDto.type";

import type { StoredGameFm } from "./storedGameFm.type";

export function fromStoredGameDtoToStoredGameFm(
	game: StoredGameDto,
): StoredGameFm {
	return {
		...game,
		versions: game.versions.map((version) => ({
			...version,
			isOriginal: version.id === game.id,
		})),
		dlcs: game.dlcs.map((dlc) => ({ ...dlc })),
		customization:
			game.customization === null ? null : { ...game.customization },
	};
}
