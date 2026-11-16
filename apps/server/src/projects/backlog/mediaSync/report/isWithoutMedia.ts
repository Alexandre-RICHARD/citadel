import type { DiskIndex } from "../disk/diskIndex.type.ts";
import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";

/**
 * Un torrent sans média : ses fichiers ne sont que dans torrents/, aucune bibliothèque ne les utilise (de la place
 * perdue). Pas un torrent de torrents/other, ni un jamais téléchargé, ni un que Radarr ou Sonarr attend encore
 */
export function isWithoutMedia(
	torrent: SurveyedTorrent,
	disk: Pick<DiskIndex, "pathsByInode">,
	mediasRoot: string,
	queuedHashes: ReadonlySet<string>,
): boolean {
	if (
		torrent.isOther ||
		torrent.progress === 0 ||
		queuedHashes.has(torrent.hash.toLowerCase())
	)
		return false;
	return !torrent.inodes.some((inode) =>
		(disk.pathsByInode.get(inode) ?? []).some((filePath) =>
			filePath.startsWith(mediasRoot),
		),
	);
}
