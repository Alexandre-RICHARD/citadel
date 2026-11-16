import type { DiskIndex } from "../disk/diskIndex.type.ts";
import type { LibraryRoots } from "../disk/libraryRoots.type.ts";
import type { JellyfinIndex } from "../jellyfin/jellyfinIndex.type.ts";
import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";
import type { LinkContext } from "./linkContext.type.ts";

export function buildLinkContext(
	roots: LibraryRoots,
	disk: DiskIndex,
	jellyfin: JellyfinIndex,
	torrents: readonly SurveyedTorrent[],
): LinkContext {
	const torrentsByInode = new Map<number, SurveyedTorrent[]>();
	for (const torrent of torrents)
		for (const inode of new Set(torrent.inodes))
			torrentsByInode.set(inode, [
				...(torrentsByInode.get(inode) ?? []),
				torrent,
			]);
	return {
		roots,
		disk,
		jellyfin,
		torrentsByInode,
		torrentsByHash: new Map(
			torrents.map((torrent) => [torrent.hash.toLowerCase(), torrent]),
		),
	};
}
