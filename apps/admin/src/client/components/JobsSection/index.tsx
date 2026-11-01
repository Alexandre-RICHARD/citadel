import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { BellRing, Play, ScrollText } from "lucide-react";

import type { JobItem } from "../../../shared/jobItem.type";
import type { JobStatus } from "../../../shared/jobStatus.type";
import { usePolling } from "../../api/usePolling";
import { formatAgo } from "../../format/formatAgo";
import { formatDateTime } from "../../format/formatDateTime";
import type { StatusTone } from "../../status/statusTone.type";
import { StatusDot } from "../StatusDot";
import styles from "./jobsSection.module.scss";

type Props = {
	// Une action (lancer un job) est en cours ailleurs : boutons inactifs
	busy: boolean;
	onRun: (job: JobItem) => void;
	onShowLog: (job: JobItem) => void;
};

const STATUS: Record<JobStatus, { tone: StatusTone; text: string }> = {
	ok: { tone: "ok", text: "Réussi" },
	fail: { tone: "danger", text: "Échoué" },
	running: { tone: "warn", text: "En cours" },
	never: { tone: "idle", text: "Jamais lancé" },
};

function lastRun(job: JobItem, now: number): string {
	const date = job.finishedAt ?? job.startedAt;
	return date === null ? "–" : formatAgo(date, now);
}

// Les jobs d'infra-ops : dernier résultat et ses contrôles, prochain passage, log,
// « Lancer maintenant ». Relus toutes les 15 s : un job lancé passe vite à « En cours ».
export function JobsSection({ busy, onRun, onShowLog }: Props) {
	const { data, updatedAt, error } = usePolling<JobItem[]>("/jobs", 15_000);

	return (
		<section
			className={styles.jobsSection}
			aria-labelledby="jobs-title"
		>
			<h2
				id="jobs-title"
				className={styles.title}
			>
				Jobs
			</h2>
			{error ? <p className={styles.error}>{error}</p> : null}
			{data === null && !error ? (
				<p className={styles.muted}>Lecture…</p>
			) : null}
			<ul className={styles.list}>
				{(data ?? []).map((job) => {
					const status = STATUS[job.status];
					const failed = job.checks.filter((check) => !check.ok);
					return (
						<li
							key={job.name}
							className={styles.job}
						>
							<div className={styles.identity}>
								<StatusDot
									tone={status.tone}
									label={status.text}
								/>
								<div className={styles.names}>
									<span className={styles.name}>
										{job.label}
										{job.monitored ? (
											<span
												className={styles.monitored}
												title="Suivi par healthchecks.io : alerte s'il échoue ou ne passe pas"
											>
												<BellRing
													size={13}
													aria-label="Suivi par healthchecks.io"
												/>
											</span>
										) : null}
									</span>
									<span className={styles.description}>{job.description}</span>
								</div>
							</div>
							<div className={styles.result}>
								<span>{`${status.text} · ${lastRun(job, updatedAt)}`}</span>
								{job.checks.length > 0 ? (
									<details className={styles.checks}>
										<summary>
											{failed.length > 0
												? `${failed.length} contrôle(s) en échec`
												: `${job.checks.length} contrôle(s) réussi(s)`}
										</summary>
										<ul>
											{job.checks.map((check) => (
												<li
													key={check.label}
													data-ok={check.ok}
												>
													{`${check.ok ? "✓" : "✗"} ${check.label}${check.detail ? ` : ${check.detail}` : ""}`}
												</li>
											))}
										</ul>
									</details>
								) : null}
							</div>
							<span
								className={styles.next}
								title={job.cron ?? undefined}
							>
								{job.nextRunAt ? formatDateTime(new Date(job.nextRunAt)) : "–"}
							</span>
							<div className={styles.actions}>
								<IconButton
									icon={Play}
									label={`Lancer ${job.label} maintenant`}
									size="sm"
									disabled={busy || job.status === "running"}
									onClick={() => onRun(job)}
								/>
								<IconButton
									icon={ScrollText}
									label={`Log du dernier passage de ${job.label}`}
									size="sm"
									onClick={() => onShowLog(job)}
								/>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
