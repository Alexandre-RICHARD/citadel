import { Globe } from "lucide-react";

import type { SiteStatus } from "../../../shared/siteStatus.type";
import { usePolling } from "../../api/usePolling";
import { describeMailFailures } from "../../format/describeMailFailures";
import { describeUnsentContactMessages } from "../../format/describeUnsentContactMessages";
import { Card } from "../Card";
import styles from "./siteCard.module.scss";

const VISIBLE_HISTORY = 4;

// La version ne change qu'au déploiement : relue chaque minute. Les mails qui n'ont pas pu partir sont seulement
// signalés : le détail est en base
export function SiteCard() {
	const { data, error } = usePolling<SiteStatus>("/site", 60_000);
	const mailFailures = describeMailFailures(data?.mailFailures ?? null);
	const unsentContact = describeUnsentContactMessages(
		data?.unsentContactMessages ?? null,
	);

	return (
		<Card
			title="Site"
			icon={Globe}
			error={error}
			status={
				unsentContact
					? { tone: "danger", text: unsentContact.status }
					: mailFailures
						? { tone: "warn", text: mailFailures.status }
						: undefined
			}
		>
			<div>
				<p className={styles.label}>Version en prod</p>
				<p className={styles.version}>
					{data?.currentVersion ?? (data ? "aucun déploiement" : "…")}
				</p>
			</div>
			{unsentContact ? (
				<div
					className={`${styles.alert} ${styles.urgent}`}
					role="status"
				>
					<p>{unsentContact.message}</p>
				</div>
			) : null}
			{mailFailures ? (
				<div
					className={styles.alert}
					role="status"
				>
					<p>{mailFailures.message}</p>
					{mailFailures.detail !== null ? (
						<p className={styles.hint}>{mailFailures.detail}</p>
					) : null}
				</div>
			) : null}
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
