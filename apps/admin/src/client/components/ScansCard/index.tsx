import { ShieldAlert } from "lucide-react";

import type { SiteTraffic } from "../../../shared/siteTraffic.type";
import { formatAgo } from "../../format/formatAgo";
import { Card } from "../Card";
import styles from "./scansCard.module.scss";

type Props = {
	traffic: SiteTraffic | null;
	now: number;
};

const VISIBLE_SCANS = 6;

// Les robots qui cherchent une faille connue (/wp-login.php, /.env…). Le site n'a rien
// de tout ça : ils tombent sur des 404. Utile pour voir qui insiste.
export function ScansCard({ traffic, now }: Props) {
	const scans = traffic?.available ? traffic.recentScans : [];

	return (
		<Card
			title="Scans suspects"
			icon={ShieldAlert}
		>
			{scans.length === 0 ? (
				<p className={styles.muted}>
					{traffic?.available ? "Aucun sur 24 h" : "–"}
				</p>
			) : (
				<ol className={styles.list}>
					{scans.slice(0, VISIBLE_SCANS).map((scan) => (
						<li
							key={`${scan.at}${scan.ip}${scan.path}`}
							className={styles.scan}
						>
							<span className={styles.path}>{scan.path}</span>
							<span className={styles.meta}>
								{[scan.ip, scan.country, formatAgo(scan.at, now)]
									.filter(Boolean)
									.join(" · ")}
							</span>
						</li>
					))}
				</ol>
			)}
		</Card>
	);
}
