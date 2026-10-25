import { CalendarClock } from "lucide-react";

import type { DeadlineItem } from "../../../shared/deadlineItem.type";
import { usePolling } from "../../api/usePolling";
import { formatDuration } from "../../format/formatDuration";
import { deadlineTone } from "../../status/deadlineTone";
import type { StatusTone } from "../../status/statusTone.type";
import { Card } from "../Card";
import { StatusDot } from "../StatusDot";
import styles from "./deadlinesCard.module.scss";

const TONE_ORDER: StatusTone[] = ["danger", "warn", "ok"];
const CARD_STATUS: Record<string, string> = {
	danger: "À traiter",
	warn: "Bientôt",
	ok: "À jour",
};

function describeDeadline(item: DeadlineItem, now: number): string {
	if (item.problem) return item.problem;
	if (!item.expiresAt) return "n'expire jamais";
	const date = new Date(item.expiresAt).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const secondsLeft = (Date.parse(item.expiresAt) - now) / 1000;
	return secondsLeft > 0
		? `${date} · dans ${formatDuration(secondsLeft)}`
		: `${date} · expiré`;
}

// Fonctionnalité 8 (§14.3) : ce qui expire. Les dates bougent peu : relues toutes les 5 min
export function DeadlinesCard() {
	const { data, updatedAt, error } = usePolling<DeadlineItem[]>(
		"/deadlines",
		300_000,
	);
	const tones = (data ?? []).map((item) => deadlineTone(item, updatedAt));
	const worst = TONE_ORDER.find((tone) => tones.includes(tone));

	return (
		<Card
			title="Échéances"
			icon={CalendarClock}
			status={
				worst ? { tone: worst, text: CARD_STATUS[worst] ?? "" } : undefined
			}
			error={error}
		>
			{data ? (
				<ul className={styles.list}>
					{data.map((item, index) => (
						<li
							key={item.label}
							className={styles.item}
						>
							<StatusDot
								tone={tones[index] ?? "idle"}
								label={describeDeadline(item, updatedAt)}
							/>
							<span className={styles.text}>
								<span className={styles.label}>{item.label}</span>
								<span className={styles.detail}>
									{describeDeadline(item, updatedAt)}
								</span>
							</span>
						</li>
					))}
				</ul>
			) : (
				<p className={styles.muted}>Lecture…</p>
			)}
		</Card>
	);
}
