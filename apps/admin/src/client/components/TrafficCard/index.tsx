import { Activity } from "lucide-react";

import type { SiteTraffic } from "../../../shared/siteTraffic.type";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./trafficCard.module.scss";

// Au-delà, un appel se sent : le chiffre passe en alerte
const SLOW_MS = 500;

type Props = {
	traffic: SiteTraffic | null;
	error: string | null;
};

// Volumes du site et de Jellyfin sur 24 h, les IP qui en font le plus, et les endpoints de l'API les plus lents
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
			{traffic.slowestEndpoints.length > 0 ? (
				<div className={styles.scroll}>
					<table
						className={styles.timings}
						aria-label="Temps de réponse de l'API"
					>
						<thead>
							<tr>
								<th scope="col">Endpoint (ms)</th>
								<th scope="col">Appels</th>
								<th scope="col">Médiane</th>
								<th scope="col">95 %</th>
								<th scope="col">Max</th>
							</tr>
						</thead>
						<tbody>
							{traffic.slowestEndpoints.map((timing) => (
								<tr key={timing.endpoint}>
									<th
										scope="row"
										className={styles.endpoint}
										title={timing.endpoint}
									>
										{timing.endpoint}
									</th>
									<td>{timing.requestCount}</td>
									<td>{Math.round(timing.medianMs)}</td>
									<td
										className={
											timing.p95Ms >= SLOW_MS ? styles.slow : undefined
										}
									>
										{Math.round(timing.p95Ms)}
									</td>
									<td>{Math.round(timing.maxMs)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : null}
		</Card>
	);
}
