import path from "node:path";

import type { QbittorrentEntry } from "../client/qbittorrentEntry.type.ts";
import type { DiskIndex } from "../disk/diskIndex.type.ts";
import { classifyTorrentStatus } from "./classifyTorrentStatus.ts";
import { findReachableTrackers } from "./findReachableTrackers.ts";
import { QBITTORRENT_TRACKER_STATUS } from "./qbittorrentTrackerStatus.ts";
import type { SurveyedTorrent } from "./surveyedTorrent.type.ts";
import type { TrackerIdentity } from "./trackerIdentity.type.ts";

const MESSAGE_MAX_LENGTH = 200;

function splitTags(tags: string | null | undefined): string[] {
	return (tags ?? "")
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => tag !== "");
}

/**
 * Les torrents de qBittorrent, classés (classifyTorrentStatus) et reliés au disque par leurs fichiers.
 * `otherTorrentsRoot` : torrents/other, qui ne sont pas des médias
 */
export function surveyTorrents(
	entries: readonly QbittorrentEntry[],
	nameTracker: (url: string) => TrackerIdentity,
	disk: DiskIndex,
	otherTorrentsRoot: string,
): SurveyedTorrent[] {
	const reachableLabels = findReachableTrackers(entries, nameTracker);
	return entries.map((entry) => {
		const { torrent, trackers, fileNames } = entry;
		const working = trackers.find(
			({ status }) => status === QBITTORRENT_TRACKER_STATUS.WORKING,
		);
		const chosen = working ?? trackers.at(0);
		const filePaths = fileNames.map((name) =>
			path.posix.join(torrent.save_path.replaceAll("\\", "/"), name),
		);
		const message =
			trackers.map(({ msg }) => msg?.trim() ?? "").find((msg) => msg !== "") ??
			null;
		return {
			hash: torrent.hash,
			name: torrent.name,
			category: torrent.category === "" ? null : (torrent.category ?? null),
			tags: splitTags(torrent.tags),
			addedAt: new Date(torrent.added_on * 1000).toISOString(),
			progress: torrent.progress,
			sizeBytes: Math.round(torrent.size),
			status: classifyTorrentStatus(entry, nameTracker, reachableLabels),
			tracker: chosen === undefined ? null : nameTracker(chosen.url),
			message:
				working === undefined
					? (message?.slice(0, MESSAGE_MAX_LENGTH) ?? null)
					: null,
			filePaths,
			inodes: filePaths.flatMap((filePath) => {
				const file = disk.byPath.get(filePath);
				return file === undefined ? [] : [file.inode];
			}),
			isOther: filePaths.some((filePath) =>
				filePath.startsWith(otherTorrentsRoot),
			),
		};
	});
}
