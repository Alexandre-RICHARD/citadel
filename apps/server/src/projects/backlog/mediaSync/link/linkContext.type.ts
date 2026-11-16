import type { DiskIndex } from "../disk/diskIndex.type.ts";
import type { LibraryRoots } from "../disk/libraryRoots.type.ts";
import type { JellyfinIndex } from "../jellyfin/jellyfinIndex.type.ts";
import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";

/**
 * Ce qu'il faut pour relier un fichier à tout le reste : le disque, Jellyfin, les torrents par inode (cross-seed
 * compris : le fichier de la bibliothèque et celui du torrent partagent l'inode), et les torrents par hash
 */
export type LinkContext = {
	roots: LibraryRoots;
	disk: DiskIndex;
	jellyfin: JellyfinIndex;
	torrentsByInode: ReadonlyMap<number, readonly SurveyedTorrent[]>;
	torrentsByHash: ReadonlyMap<string, SurveyedTorrent>;
};
