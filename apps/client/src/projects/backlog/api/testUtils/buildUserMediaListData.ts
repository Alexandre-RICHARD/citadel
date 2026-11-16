import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";

import type { UserMediaListData } from "../cache/media/userMediaListData.type";

/**
 * Une vue du tableau des films et séries en cache : une page par liste de lignes (null : backlog vide), toutes avec le
 * même résumé
 */
export function buildUserMediaListData(
	pages: (UserMediaDto[] | null)[],
	counts: { matchedCount: number; movieCount: number; showCount: number },
): UserMediaListData {
	return {
		pages: pages.map((userMedia) =>
			userMedia === null
				? null
				: { userMedia, ...counts, originalLanguages: ["en"] },
		),
		pageParams: pages.map((_page, index) => index + 1),
	};
}
