import type { QbittorrentEntry } from "../client/qbittorrentEntry.type.ts";
import { QBITTORRENT_TRACKER_STATUS } from "./qbittorrentTrackerStatus.ts";
import { TorrentStatusEnum } from "./torrentStatus.enum.ts";
import type { TrackerIdentity } from "./trackerIdentity.type.ts";

// États de qBittorrent où le torrent ne s'annonce plus : on ne peut rien conclure de ses trackers
const LOCAL_ERROR_STATES = new Set(["error", "missingFiles"]);
const PENDING_STATUSES = new Set<number>([
	QBITTORRENT_TRACKER_STATUS.DISABLED,
	QBITTORRENT_TRACKER_STATUS.NOT_CONTACTED,
	QBITTORRENT_TRACKER_STATUS.UPDATING,
]);

/**
 * L'état d'un torrent, le meilleur de ses adresses (§8, étape 2) : qu'une adresse refuse (« Forbidden ») quand une
 * autre accepte n'est pas une erreur. Mort seulement si son tracker répond à d'autres torrents (`reachableLabels`) ;
 * sinon inactif, revu au passage suivant
 */
export function classifyTorrentStatus(
	{ torrent, trackers }: QbittorrentEntry,
	nameTracker: (url: string) => TrackerIdentity,
	reachableLabels: ReadonlySet<string>,
): TorrentStatusEnum {
	if (
		trackers.some(({ status }) => status === QBITTORRENT_TRACKER_STATUS.WORKING)
	)
		return TorrentStatusEnum.VALID;
	if (LOCAL_ERROR_STATES.has(torrent.state) || trackers.length === 0)
		return TorrentStatusEnum.INACTIVE;
	if (trackers.some(({ status }) => PENDING_STATUSES.has(status)))
		return TorrentStatusEnum.INACTIVE;
	return trackers.some(({ url }) => reachableLabels.has(nameTracker(url).label))
		? TorrentStatusEnum.DEAD
		: TorrentStatusEnum.INACTIVE;
}
