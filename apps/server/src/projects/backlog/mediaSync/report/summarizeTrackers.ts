import type { ReportTracker } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportTracker.type.ts";

import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";
import { TorrentStatusEnum } from "../torrent/torrentStatus.enum.ts";

/**
 * Chaque tracker et ses torrents par état. Il répond quand au moins un de ses torrents est valide (une de ses adresses
 * fonctionne) ; sinon il est injoignable, seule erreur de tracker signalée (§8, étape 5). Par nom, du plus chargé au
 * moins chargé
 */
export function summarizeTrackers(
	torrents: readonly SurveyedTorrent[],
): ReportTracker[] {
	const byName = new Map<string, ReportTracker>();
	for (const { tracker, status } of torrents) {
		if (tracker === null) continue;
		const summary = byName.get(tracker.label) ?? {
			name: tracker.label,
			isReachable: false,
			torrentCount: 0,
			validCount: 0,
			deadCount: 0,
			inactiveCount: 0,
		};
		summary.torrentCount += 1;
		if (status === TorrentStatusEnum.VALID) summary.validCount += 1;
		if (status === TorrentStatusEnum.DEAD) summary.deadCount += 1;
		if (status === TorrentStatusEnum.INACTIVE) summary.inactiveCount += 1;
		summary.isReachable ||= status === TorrentStatusEnum.VALID;
		byName.set(tracker.label, summary);
	}
	return [...byName.values()].toSorted(
		(first, second) =>
			second.torrentCount - first.torrentCount ||
			first.name.localeCompare(second.name),
	);
}
