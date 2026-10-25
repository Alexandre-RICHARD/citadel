import { Clapperboard } from "lucide-react";

import type { JellyfinActivity } from "../../../shared/jellyfinActivity.type";
import { usePolling } from "../../api/usePolling";
import { formatPercent } from "../../format/formatPercent";
import { Card } from "../Card";
import styles from "./jellyfinCard.module.scss";

// Une lecture commence ou s'arrête vite : relu toutes les 15 s
export function JellyfinCard() {
	const { data, error } = usePolling<JellyfinActivity>("/jellyfin", 15_000);

	if (!data?.available)
		return (
			<Card
				title="Jellyfin"
				icon={Clapperboard}
				status={data ? { tone: "idle", text: "Indisponible" } : undefined}
				error={error}
			>
				<p className={styles.muted}>{data ? data.reason : "Lecture…"}</p>
			</Card>
		);

	const count = data.playbacks.length;
	return (
		<Card
			title="Jellyfin"
			icon={Clapperboard}
			status={
				count > 0
					? { tone: "ok", text: `${count} lecture${count > 1 ? "s" : ""}` }
					: { tone: "idle", text: "Aucune lecture" }
			}
			error={error}
		>
			{count === 0 ? (
				<p className={styles.muted}>
					{`${data.activeSessionCount} appareil${data.activeSessionCount > 1 ? "s" : ""} actif${data.activeSessionCount > 1 ? "s" : ""} ces 10 dernières minutes`}
				</p>
			) : (
				<ul className={styles.list}>
					{data.playbacks.map((playback) => (
						<li
							key={`${playback.user}${playback.device}`}
							className={styles.playback}
						>
							<span className={styles.title}>{playback.title}</span>
							<span className={styles.meta}>
								{[
									playback.user,
									playback.device,
									playback.paused ? "en pause" : null,
									playback.transcoding ? "transcodage" : "direct",
									playback.progress === null
										? null
										: formatPercent(playback.progress * 100),
								]
									.filter(Boolean)
									.join(" · ")}
							</span>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}
