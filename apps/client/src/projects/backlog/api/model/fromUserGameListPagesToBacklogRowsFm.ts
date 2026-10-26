import type { UserGameListDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameListDto.type";
import type { InfiniteData } from "@tanstack/react-query";

import type { BacklogRowsFm } from "./backlogRowsFm.type";
import { fromUserGameDtoToBacklogRowFm } from "./fromUserGameDtoToBacklogRowFm";

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
		rows: userGames.map(fromUserGameDtoToBacklogRowFm),
		matchedCount: data.pages.at(0)?.matchedCount ?? 0,
	};
}
