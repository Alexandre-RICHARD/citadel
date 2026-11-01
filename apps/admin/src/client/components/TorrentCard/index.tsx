import { ArrowDown, ArrowUp, HardDriveDownload } from "lucide-react";

import type { TorrentHistory } from "../../../shared/torrentHistory.type";
import type { TorrentStats } from "../../../shared/torrentStats.type";
import type { TorrentVolume } from "../../../shared/torrentVolume.type";
import { usePolling } from "../../api/usePolling";
import { formatBytes } from "../../format/formatBytes";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./torrentCard.module.scss";

const ratioFormat = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 2,
});

function totals(downloaded: number | null, uploaded: number | null): string {
	if (downloaded === null || uploaded === null) return "–";
	return `↓ ${formatBytes(downloaded)} · ↑ ${formatBytes(uploaded)}`;
}

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
	weekday: "short",
	day: "numeric",
});
const weekFormat = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "short",
});

function volumeRows(
	volumes: TorrentVolume[],
	format: (period: string) => string,
) {
	return volumes.map((volume) => (
		<Stat
			key={volume.period}
			label={format(volume.period)}
		>
			{totals(volume.downloaded, volume.uploaded)}
		</Stat>
	));
}

// Les volumes par jour et par semaine, tirés des relevés horaires d'infra-ops (job
// qbittorrent-stats) : ils ne changent qu'une fois par heure
function HistoryDetails() {
	const { data } = usePolling<TorrentHistory>("/torrents/history", 300_000);
	if (!data) return null;
	return (
		<details className={styles.history}>
			<summary>Historique</summary>
			<p className={styles.historyTitle}>Par jour</p>
			{volumeRows(data.days, (period) =>
				dayFormat.format(new Date(`${period}T12:00:00`)),
			)}
			<p className={styles.historyTitle}>Par semaine (du lundi)</p>
			{volumeRows(data.weeks, (period) =>
				weekFormat.format(new Date(`${period}T12:00:00`)),
			)}
		</details>
	);
}

export function TorrentCard() {
	const { data, error } = usePolling<TorrentStats>("/torrents", 5000);

	if (!data)
		return (
			<Card
				title="qBittorrent"
				icon={HardDriveDownload}
				error={error}
			>
				<p className={styles.muted}>Lecture…</p>
			</Card>
		);

	if (!data.available)
		return (
			<Card
				title="qBittorrent"
				icon={HardDriveDownload}
				status={{ tone: "idle", text: "Indisponible" }}
				error={error}
			>
				<p className={styles.muted}>{data.reason}</p>
			</Card>
		);

	return (
		<Card
			title="qBittorrent"
			icon={HardDriveDownload}
			error={error}
		>
			<div className={styles.speeds}>
				<span className={styles.speed}>
					<ArrowDown
						size={16}
						aria-label="Réception"
					/>
					{`${formatBytes(data.downloadSpeed)}/s`}
				</span>
				<span className={styles.speed}>
					<ArrowUp
						size={16}
						aria-label="Envoi"
					/>
					{`${formatBytes(data.uploadSpeed)}/s`}
				</span>
			</div>
			<Stat label="Depuis le démarrage">
				{totals(data.sessionDownloaded, data.sessionUploaded)}
			</Stat>
			<Stat label="Depuis toujours">
				{totals(data.allTimeDownloaded, data.allTimeUploaded)}
			</Stat>
			<Stat label="Ratio">
				{data.ratio === null ? "–" : ratioFormat.format(data.ratio)}
			</Stat>
			<HistoryDetails />
		</Card>
	);
}
