import type { JellyfinItem } from "../client/jellyfinItem.type.ts";

/**
 * Jellyfin rangé pour le job : chaque élément par l'inode de son fichier (un fichier renommé reste le même), les séries
 * par leur identifiant Jellyfin, et la collection de chaque élément
 */
export type JellyfinIndex = {
	byInode: ReadonlyMap<number, JellyfinItem>;
	seriesById: ReadonlyMap<string, JellyfinItem>;
	collectionByItemId: ReadonlyMap<string, string>;
};
