import type { JellyfinItem } from "../client/jellyfinItem.type.ts";

// L'identifiant TMDB que Jellyfin donne à un élément ; null s'il n'en a pas (ou un illisible)
export function readJellyfinTmdbId(
	item: JellyfinItem | null | undefined,
): number | null {
	const tmdbId = Number(item?.ProviderIds?.Tmdb);
	return Number.isInteger(tmdbId) && tmdbId > 0 ? tmdbId : null;
}
