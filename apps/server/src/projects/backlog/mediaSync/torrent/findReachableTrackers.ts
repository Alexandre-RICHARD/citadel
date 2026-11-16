import type { QbittorrentEntry } from "../client/qbittorrentEntry.type.ts";
import { QBITTORRENT_TRACKER_STATUS } from "./qbittorrentTrackerStatus.ts";
import type { TrackerIdentity } from "./trackerIdentity.type.ts";

/**
 * Les trackers qui répondent : au moins une de leurs adresses fonctionne sur au moins un torrent, d'après qBittorrent.
 * Le job n'appelle jamais un tracker lui-même. Rend leurs `label`
 */
export function findReachableTrackers(
	entries: readonly QbittorrentEntry[],
	nameTracker: (url: string) => TrackerIdentity,
): Set<string> {
	return new Set(
		entries.flatMap(({ trackers }) =>
			trackers
				.filter(({ status }) => status === QBITTORRENT_TRACKER_STATUS.WORKING)
				.map(({ url }) => nameTracker(url).label),
		),
	);
}
