import type { ReportTorrent } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportTorrent.type.ts";

import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";

export function toReportTorrent(torrent: SurveyedTorrent): ReportTorrent {
	return {
		hash: torrent.hash,
		name: torrent.name,
		trackerName: torrent.tracker?.label ?? null,
		category: torrent.category,
		message: torrent.message,
		progressPercent: Math.round(torrent.progress * 1000) / 10,
		sizeBytes: torrent.sizeBytes,
		addedAt: torrent.addedAt,
	};
}
