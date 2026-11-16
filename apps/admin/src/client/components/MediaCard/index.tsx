import { formatFileSize } from "@citadel/common/src/universal/number/formatFileSize";
import { Film } from "lucide-react";

import type { MediaReportResponse } from "../../../shared/mediaReportResponse.type";
import { usePolling } from "../../api/usePolling";
import { formatCount } from "../../format/formatCount";
import { formatDateTime } from "../../format/formatDateTime";
import { formatDelta } from "../../format/formatDelta";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./mediaCard.module.scss";

function withDelta(current: number, previous: number | null): string {
	const delta = formatDelta(current, previous);
	return delta === null
		? formatCount(current)
		: `${formatCount(current)} (${delta})`;
}

// Les chiffres du dernier passage de media-sync, et le lien vers son rapport (§8, étape 5). Le job passe la nuit : une
// relecture par minute suffit
export function MediaCard() {
	const { data, error } = usePolling<MediaReportResponse>(
		"/media-report",
		60_000,
	);
	const report = data?.report ?? null;

	if (report === null)
		return (
			<Card
				title="Médias"
				icon={Film}
				error={error}
			>
				<p className={styles.muted}>
					{data === null
						? "Lecture…"
						: "Aucun rapport pour l'instant : le job media-sync passe chaque nuit à 2 h."}
				</p>
			</Card>
		);

	const { summary, previousSummary: previous } = report;
	return (
		<Card
			title="Médias"
			icon={Film}
			error={error}
		>
			<Stat label="Dernier passage">
				{formatDateTime(new Date(report.finishedAt))}
			</Stat>
			<Stat label="Torrents">
				{withDelta(summary.torrentCount, previous?.torrentCount ?? null)}
			</Stat>
			<Stat label="Valides">
				{withDelta(summary.validCount, previous?.validCount ?? null)}
			</Stat>
			<Stat label="Morts">
				{withDelta(
					summary.deadFinishedCount + summary.deadUnfinishedCount,
					previous === null
						? null
						: previous.deadFinishedCount + previous.deadUnfinishedCount,
				)}
			</Stat>
			<Stat label="Inactifs">
				{withDelta(summary.inactiveCount, previous?.inactiveCount ?? null)}
			</Stat>
			<Stat label="Sans média">
				{`${summary.withoutMediaCount} · ${formatFileSize(summary.withoutMediaBytes)}`}
			</Stat>
			<Stat label="Doublons">
				{withDelta(summary.duplicateCount, previous?.duplicateCount ?? null)}
			</Stat>
			<a
				className={styles.link}
				href="/media"
			>
				Voir le rapport
			</a>
		</Card>
	);
}
