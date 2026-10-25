import { ArrowDown, ArrowUp, HardDriveDownload } from "lucide-react";

import type { TorrentStats } from "../../../shared/torrentStats.type";
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
		</Card>
	);
}
