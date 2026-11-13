import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type";
import type { InfiniteData } from "@tanstack/react-query";

import type { BacklogRowFm } from "./backlogRowFm.type";
import type { BacklogRowsFm } from "./backlogRowsFm.type";
import { fromUserGameDtoToBacklogRowFm } from "./fromUserGameDtoToBacklogRowFm";

// TanStack Query garde la même référence pour un jeu que la relecture n'a pas changé : sa ligne reste la même, et le tableau
// ne redessine que les lignes qui ont changé
const rowsByUserGame = new WeakMap<UserGameDto, BacklogRowFm>();

function getBacklogRowFm(userGame: UserGameDto): BacklogRowFm {
	const cachedRow = rowsByUserGame.get(userGame);
	if (cachedRow !== undefined) return cachedRow;
	const row = fromUserGameDtoToBacklogRowFm(userGame);
	rowsByUserGame.set(userGame, row);
	return row;
}

/**
 * Pages du tableau → lignes. Une page vide (204) n'en a pas. Un jeu ajouté de façon optimiste en tête peut revenir dans
 * une page chargée ensuite : il ne garde que sa première place
 */
export function fromUserGameListPagesToBacklogRowsFm(
	data: InfiniteData<UserGameListDto | null>,
): BacklogRowsFm {
	const seenGameIds = new Set<number>();
	const userGames = data.pages
		.flatMap((page) => page?.userGames ?? [])
		.filter(({ game }) => {
			if (seenGameIds.has(game.id)) return false;
			seenGameIds.add(game.id);
			return true;
		});
	return {
		rows: userGames.map(getBacklogRowFm),
		matchedCount: data.pages.at(0)?.matchedCount ?? 0,
	};
}
