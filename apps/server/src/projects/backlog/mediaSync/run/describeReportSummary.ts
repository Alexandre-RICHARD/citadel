import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";

// La dernière ligne du job, reprise par infra-ops dans son contrôle « relevé » (console, healthchecks.io)
export function describeReportSummary({
	summary,
	tags,
}: MediaSyncReport): string {
	return [
		`${summary.torrentCount} torrents (${summary.validCount} valides, ${summary.deadFinishedCount + summary.deadUnfinishedCount} morts, ${summary.inactiveCount} inactifs)`,
		`${summary.withoutMediaCount} sans média`,
		`${summary.duplicateCount} doublons`,
		`${summary.withoutTorrentCount} fichiers sans torrent`,
		`étiquette posée sur ${tags.added}, retirée de ${tags.removed}`,
	].join(", ");
}
