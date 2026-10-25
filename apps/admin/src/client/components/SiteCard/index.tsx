import { Globe } from "lucide-react";

import type { SiteStatus } from "../../../shared/siteStatus.type";
import { usePolling } from "../../api/usePolling";
import { Card } from "../Card";
import styles from "./siteCard.module.scss";

const VISIBLE_HISTORY = 4;

// La version ne change qu'au déploiement : relue chaque minute
export function SiteCard() {
	const { data, error } = usePolling<SiteStatus>("/site", 60_000);

	return (
		<Card
			title="Site"
			icon={Globe}
			error={error}
		>
			<div>
				<p className={styles.label}>Version en prod</p>
				<p className={styles.version}>
					{data?.currentVersion ?? (data ? "aucun déploiement" : "…")}
				</p>
			</div>
			{data && data.history.length > 0 ? (
				<ol className={styles.history}>
					{data.history.slice(0, VISIBLE_HISTORY).map((entry) => (
						<li
							key={`${entry.date}${entry.text}`}
							className={styles.entry}
						>
							<time className={styles.date}>{entry.date.slice(0, 16)}</time>
							<span className={styles.text}>{entry.text}</span>
						</li>
					))}
				</ol>
			) : null}
		</Card>
	);
}
