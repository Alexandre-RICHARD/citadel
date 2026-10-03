import type { GameListDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameListDto.type";

import { fromGameSummaryDtoToGameSummaryFm } from "./fromGameSummaryDtoToGameSummaryFm";
import type { GameListFm } from "./gameListFm.type";

const nameCollator = new Intl.Collator("fr", { sensitivity: "base" });

// null : réponse 204, aucun jeu. Le tri est refait ici : un jeu ajouté ou renommé de façon optimiste prend tout de suite sa place
export function fromGameListDtoToGameListFm(
	gameList: GameListDto | null,
): GameListFm {
	const games = (gameList?.games ?? [])
		.map(fromGameSummaryDtoToGameSummaryFm)
		.sort(
			(first, second) =>
				nameCollator.compare(first.name, second.name) || first.id - second.id,
		);

	return {
		games,
		totalDeath: games.reduce((total, game) => total + game.totalDeath, 0),
	};
}
