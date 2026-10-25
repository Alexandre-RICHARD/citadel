import { Activity } from "lucide-react";

import type { SiteTraffic } from "../../../shared/siteTraffic.type";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./trafficCard.module.scss";

type Props = {
	traffic: SiteTraffic | null;
	error: string | null;
};

// Volumes du site et de Jellyfin sur 24 h, et les IP qui en font le plus
export function TrafficCard({ traffic, error }: Props) {
	if (!traffic?.available)
		return (
			<Card
				title="Requêtes, 24 h"
				icon={Activity}
				error={error}
			>
				<p className={styles.muted}>{traffic ? traffic.reason : "Lecture…"}</p>
			</Card>
		);

	const partial = traffic.truncated ? " (partiel)" : "";
	return (
		<Card
			title={`Requêtes, ${traffic.windowHours} h`}
			icon={Activity}
			error={error}
		>
			<div className={styles.stats}>
				<Stat label="Requêtes">{`${traffic.requestCount}${partial}`}</Stat>
				<Stat label="IP différentes">{traffic.uniqueIpCount}</Stat>
				<Stat label="Requêtes de scan">{traffic.scanCount}</Stat>
			</div>
			{traffic.topIps.length > 0 ? (
				<ol
					className={styles.topIps}
					aria-label="IP les plus actives"
				>
					{traffic.topIps.map((activity) => (
						<li
							key={activity.ip}
							className={styles.ip}
						>
							<span className={styles.address}>{activity.ip}</span>
							{activity.country ? (
								<span className={styles.country}>{activity.country}</span>
							) : null}
							<span className={styles.count}>
								{activity.requestCount}
								{activity.scanCount > 0 ? (
									<span className={styles.scans}>
										{` dont ${activity.scanCount} scan${activity.scanCount > 1 ? "s" : ""}`}
									</span>
								) : null}
							</span>
						</li>
					))}
				</ol>
			) : null}
		</Card>
	);
}
