import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";

import type { UserMediaListData } from "../../cache/media/userMediaListData.type";
import { fromUserMediaDtoToMediaRowFm } from "./fromUserMediaDtoToMediaRowFm";
import type { MediaRowFm } from "./mediaRowFm.type";
import type { MediaRowsFm } from "./mediaRowsFm.type";

// TanStack Query garde la même référence pour un média que la relecture n'a pas changé : sa ligne reste la même, et le
// tableau ne redessine que les lignes qui ont changé
const rowsByUserMedia = new WeakMap<UserMediaDto, MediaRowFm>();

function getMediaRowFm(userMedia: UserMediaDto): MediaRowFm {
	const cachedRow = rowsByUserMedia.get(userMedia);
	if (cachedRow !== undefined) return cachedRow;
	const row = fromUserMediaDtoToMediaRowFm(userMedia);
	rowsByUserMedia.set(userMedia, row);
	return row;
}

/**
 * Pages du tableau → lignes. Un backlog vide (204) n'en a pas. Un média ajouté de façon optimiste en tête peut revenir
 * dans une page chargée ensuite : il ne garde que sa première place. Le résumé est celui de la première page
 */
export function fromUserMediaListPagesToMediaRowsFm(
	data: UserMediaListData,
): MediaRowsFm {
	const seenIds = new Set<number>();
	const userMediaList = data.pages
		.flatMap((page) => page?.userMedia ?? [])
		.filter(({ id }) => {
			if (seenIds.has(id)) return false;
			seenIds.add(id);
			return true;
		});
	const firstPage = data.pages.at(0) ?? null;
	return {
		rows: userMediaList.map(getMediaRowFm),
		matchedCount: firstPage?.matchedCount ?? 0,
		movieCount: firstPage?.movieCount ?? 0,
		showCount: firstPage?.showCount ?? 0,
		originalLanguages: firstPage?.originalLanguages ?? [],
	};
}
