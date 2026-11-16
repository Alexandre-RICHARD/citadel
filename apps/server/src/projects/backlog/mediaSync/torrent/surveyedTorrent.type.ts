import type { TorrentStatusEnum } from "./torrentStatus.enum.ts";
import type { TrackerIdentity } from "./trackerIdentity.type.ts";

/**
 * Un torrent classé par le job. `tracker` : celui dont une adresse fonctionne, sinon le premier ; null sans tracker.
 * `filePaths` : ses fichiers sur le disque ; `inodes` : ceux que le disque connaît. `isOther` : dans torrents/other,
 * pas un média
 */
export type SurveyedTorrent = {
	hash: string;
	name: string;
	category: string | null;
	tags: string[];
	addedAt: string;
	progress: number;
	sizeBytes: number;
	status: TorrentStatusEnum;
	tracker: TrackerIdentity | null;
	message: string | null;
	filePaths: string[];
	inodes: number[];
	isOther: boolean;
};
