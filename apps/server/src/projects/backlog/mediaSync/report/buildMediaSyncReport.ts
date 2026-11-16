import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";
import { MEDIA_SYNC_REPORT_FORMAT_VERSION } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportFormatVersion.ts";
import type { ReportTorrent } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportTorrent.type.ts";

import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";
import { TorrentStatusEnum } from "../torrent/torrentStatus.enum.ts";
import { countFilesWithoutTorrent } from "./countFilesWithoutTorrent.ts";
import { isWithoutMedia } from "./isWithoutMedia.ts";
import type { ReportInputs } from "./reportInputs.type.ts";
import { summarizeTrackers } from "./summarizeTrackers.ts";
import { toReportTorrent } from "./toReportTorrent.ts";

// L'étiquette que cross-seed pose sur les torrents qu'il ajoute
const CROSS_SEED_TAG = "cross-seed";

function byName(torrents: readonly SurveyedTorrent[]): ReportTorrent[] {
	return torrents
		.map(toReportTorrent)
		.toSorted((first, second) =>
			first.name.localeCompare(second.name, "fr", { numeric: true }),
		);
}

function bySize(torrents: readonly SurveyedTorrent[]): ReportTorrent[] {
	return torrents
		.map(toReportTorrent)
		.toSorted((first, second) => second.sizeBytes - first.sizeBytes);
}

function withStatus(
	torrents: readonly SurveyedTorrent[],
	status: TorrentStatusEnum,
): SurveyedTorrent[] {
	return torrents.filter((torrent) => torrent.status === status);
}

/**
 * Le rapport d'un passage pour la console (§8, étape 5) : les torrents et leurs trackers, comparés au passage précédent.
 * Ce que cross-seed a ajouté : les torrents de son étiquette ajoutés depuis le début du passage d'avant (aucun au
 * premier passage)
 */
export function buildMediaSyncReport(inputs: ReportInputs): MediaSyncReport {
	const { torrents } = inputs;
	const dead = withStatus(torrents, TorrentStatusEnum.DEAD);
	const deadFinished = dead.filter(({ progress }) => progress >= 1);
	const deadUnfinished = dead.filter(({ progress }) => progress < 1);
	const inactive = withStatus(torrents, TorrentStatusEnum.INACTIVE);
	const withoutMedia = torrents.filter((torrent) =>
		isWithoutMedia(
			torrent,
			inputs.disk,
			inputs.mediasRoot,
			inputs.queuedHashes,
		),
	);
	const neverDownloaded = torrents.filter(
		({ progress, isOther }) => progress === 0 && !isOther,
	);
	const previousStart = inputs.previous?.startedAt ?? null;
	const crossSeedAdded =
		previousStart === null
			? []
			: torrents.filter(
					({ tags, addedAt }) =>
						tags.includes(CROSS_SEED_TAG) &&
						Date.parse(addedAt) > Date.parse(previousStart),
				);
	const trackers = summarizeTrackers(torrents);
	return {
		formatVersion: MEDIA_SYNC_REPORT_FORMAT_VERSION,
		startedAt: inputs.startedAt,
		finishedAt: inputs.finishedAt,
		crossSeedSearch: inputs.crossSeedSearch,
		summary: {
			torrentCount: torrents.length,
			validCount: withStatus(torrents, TorrentStatusEnum.VALID).length,
			deadFinishedCount: deadFinished.length,
			deadUnfinishedCount: deadUnfinished.length,
			inactiveCount: inactive.length,
			unreachableTrackerCount: trackers.filter(
				({ isReachable }) => !isReachable,
			).length,
			withoutMediaCount: withoutMedia.length,
			withoutMediaBytes: withoutMedia.reduce(
				(total, { sizeBytes }) => total + sizeBytes,
				0,
			),
			neverDownloadedCount: neverDownloaded.length,
			duplicateCount: inputs.duplicates.length,
			withoutTorrentCount: countFilesWithoutTorrent(inputs.survey),
			crossSeedAddedCount: crossSeedAdded.length,
		},
		previousSummary: inputs.previous?.summary ?? null,
		trackers,
		deadUnfinished: byName(deadUnfinished),
		deadFinished: byName(deadFinished),
		inactive: byName(inactive),
		withoutMedia: bySize(withoutMedia),
		neverDownloaded: byName(neverDownloaded),
		duplicates: inputs.duplicates.toSorted((first, second) =>
			first.label.localeCompare(second.label, "fr"),
		),
		crossSeedAdded: byName(crossSeedAdded),
		tags: inputs.tags,
	};
}
