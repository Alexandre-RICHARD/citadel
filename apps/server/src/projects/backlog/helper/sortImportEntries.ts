import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { MediaImportEntryBean } from "../bean/mediaImportEntryBean.type.ts";

type KnownIds = {
	movies: Set<number>;
	shows: Set<number>;
};

type SortedEntries = {
	duplicates: MediaImportEntryBean[];
	alreadyInBacklog: MediaImportEntryBean[];
	stored: MediaImportEntryBean[];
	toFetch: MediaImportEntryBean[];
};

function has(ids: KnownIds, { mediaType, tmdbId }: MediaImportEntryBean) {
	return (mediaType === MediaTypeEnum.MOVIE ? ids.movies : ids.shows).has(
		tmdbId,
	);
}

/**
 * Les lignes d'un import, réparties avant toute lecture sur TMDB : un média répété plus bas dans la liste, un média
 * déjà dans le backlog, un média déjà en base (reconnu sans relire TMDB, §7.2), et ceux qu'il reste à lire
 */
export function sortImportEntries(
	entries: MediaImportEntryBean[],
	inBacklog: KnownIds,
	stored: KnownIds,
): SortedEntries {
	const seen = new Set<string>();
	const sorted: SortedEntries = {
		duplicates: [],
		alreadyInBacklog: [],
		stored: [],
		toFetch: [],
	};
	for (const entry of entries) {
		const key = `${entry.mediaType}:${entry.tmdbId}`;
		if (seen.has(key)) sorted.duplicates.push(entry);
		else if (has(inBacklog, entry)) sorted.alreadyInBacklog.push(entry);
		else if (has(stored, entry)) sorted.stored.push(entry);
		else sorted.toFetch.push(entry);
		seen.add(key);
	}
	return sorted;
}
