import type { JellyfinItem } from "./jellyfinItem.type.ts";

// Tout ce que le job lit de Jellyfin. `collections` : chaque collection (BoxSet) et les éléments qu'elle contient
export type JellyfinLibrary = {
	serverId: string | null;
	movies: JellyfinItem[];
	series: JellyfinItem[];
	episodes: JellyfinItem[];
	collections: { name: string; itemIds: string[] }[];
};
