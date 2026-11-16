import { formatFileSize } from "@citadel/common/src/universal/number/formatFileSize";
import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type";
import type { ReportTorrent } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportTorrent.type";
import { ArrowLeft, Castle, LogOut, RotateCw } from "lucide-react";
import { useState } from "react";

import type { JobItem } from "../../../shared/jobItem.type";
import type { MediaReportResponse } from "../../../shared/mediaReportResponse.type";
import { apiRequest } from "../../api/apiRequest";
import { usePolling } from "../../api/usePolling";
import { formatCount } from "../../format/formatCount";
import { formatDateTime } from "../../format/formatDateTime";
import { formatDuration } from "../../format/formatDuration";
import { formatStoragePath } from "../../format/formatStoragePath";
import { CROSS_SEED_SEARCH_LABELS } from "../../status/crossSeedSearchLabels";
import { ActionButton } from "../ActionButton";
import { ReportRow } from "../ReportRow";
import { ReportSection } from "../ReportSection";
import { ReportTile } from "../ReportTile";
import { RequestDialog } from "../RequestDialog";
import { StatusDot } from "../StatusDot";
import styles from "./mediaReportPage.module.scss";

type Props = {
	consoleVersion: string;
	onLogout: () => void;
};

const QUALITY_LABELS: Record<string, string> = {
	"sd": "SD",
	"hd": "HD",
	"fhd": "FHD",
	"4k": "4K",
};
const dateFormat = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

function percent(torrent: ReportTorrent): string {
	return `${String(torrent.progressPercent).replace(".", ",")} %`;
}

function addedOn(torrent: ReportTorrent): string {
	return `ajouté le ${dateFormat.format(new Date(torrent.addedAt))}`;
}

function deadRows(torrents: ReportTorrent[]) {
	return torrents.map((torrent) => (
		<ReportRow
			key={torrent.hash}
			name={torrent.name}
			cells={[
				torrent.trackerName,
				torrent.message,
				`${percent(torrent)} · ${formatFileSize(torrent.sizeBytes)}`,
			]}
		/>
	));
}

function countByTracker(torrents: ReportTorrent[]): string {
	const counts = new Map<string, number>();
	for (const { trackerName } of torrents)
		counts.set(
			trackerName ?? "sans tracker",
			(counts.get(trackerName ?? "sans tracker") ?? 0) + 1,
		);
	return [...counts]
		.map(([name, count]) => `${name} : ${formatCount(count)}`)
		.join(" · ");
}

function trackerDetail(
	report: MediaSyncReport,
	key: "torrentCount" | "validCount",
): string {
	return (
		report.trackers
			.map((tracker) => `${tracker.name} ${formatCount(tracker[key])}`)
			.join(" · ") || "aucun tracker"
	);
}

function Tiles({ report }: { report: MediaSyncReport }) {
	const { summary, previousSummary: previous } = report;
	const dead = summary.deadFinishedCount + summary.deadUnfinishedCount;
	const unreachable = summary.unreachableTrackerCount;
	return (
		<div className={styles.tiles}>
			<ReportTile
				label="Torrents"
				value={summary.torrentCount}
				previous={previous?.torrentCount ?? null}
				better="none"
				detail={trackerDetail(report, "torrentCount")}
			/>
			<ReportTile
				label="Valides"
				value={summary.validCount}
				previous={previous?.validCount ?? null}
				better="up"
				detail={trackerDetail(report, "validCount")}
			/>
			<ReportTile
				label="Morts"
				value={dead}
				previous={
					previous === null
						? null
						: previous.deadFinishedCount + previous.deadUnfinishedCount
				}
				better="down"
				detail={`${summary.deadFinishedCount} terminés · ${summary.deadUnfinishedCount} non terminés`}
			/>
			<ReportTile
				label="Inactifs"
				value={summary.inactiveCount}
				previous={previous?.inactiveCount ?? null}
				better="down"
				detail={
					unreachable === 0
						? "Tous les trackers ont répondu"
						: `${unreachable} tracker${unreachable > 1 ? "s" : ""} injoignable${unreachable > 1 ? "s" : ""}`
				}
			/>
			<ReportTile
				label="Sans torrent"
				value={summary.withoutTorrentCount}
				previous={previous?.withoutTorrentCount ?? null}
				better="down"
				detail="films et épisodes sur le disque"
			/>
			<ReportTile
				label="Doublons"
				value={summary.duplicateCount}
				previous={previous?.duplicateCount ?? null}
				better="down"
				detail="films ou épisodes à plusieurs fichiers"
			/>
			<ReportTile
				label="Cross-seed"
				value={summary.crossSeedAddedCount}
				previous={null}
				better="none"
				detail="torrents ajoutés depuis le passage précédent"
			/>
		</div>
	);
}

function Sections({ report }: { report: MediaSyncReport }) {
	const { summary, tags } = report;
	const unreachableTrackers = report.trackers.filter(
		({ isReachable }) => !isReachable,
	);
	return (
		<>
			<ReportSection
				title="Morts non terminés"
				count={String(summary.deadUnfinishedCount)}
				tone="danger"
				description="Le tracker répond mais ne connaît plus le torrent, et le téléchargement n'est pas fini : rien ne le terminera"
				rows={deadRows(report.deadUnfinished)}
				emptyText="Aucun."
			/>
			<ReportSection
				title="Morts terminés"
				count={String(summary.deadFinishedCount)}
				tone="danger"
				description="Fichiers complets : ils restent dans la bibliothèque, mais ne sont plus partagés par ce torrent"
				summary={
					<>
						<span>{countByTracker(report.deadFinished) || "Aucun"}</span>
						<span>{`Étiquette tracker-invalide posée sur ${tags.added} nouveau${tags.added > 1 ? "x" : ""}, retirée de ${tags.removed} revenu${tags.removed > 1 ? "s" : ""}`}</span>
					</>
				}
				rows={deadRows(report.deadFinished)}
				visibleCount={0}
				emptyText="Aucun."
			/>
			<ReportSection
				title="Inactifs"
				count={String(summary.inactiveCount)}
				tone="idle"
				description="Tracker qui ne répond pas, ou torrent pas encore contacté : revus au passage suivant, jamais déclarés morts"
				summary={
					unreachableTrackers.length === 0 ? undefined : (
						<span>
							{`Injoignables : ${unreachableTrackers.map(({ name, torrentCount }) => `${name} (${torrentCount} torrents)`).join(" · ")}`}
						</span>
					)
				}
				rows={deadRows(report.inactive)}
				emptyText="Aucun : tous les trackers ont répondu."
			/>
			<ReportSection
				title="Torrents sans média"
				count={`${summary.withoutMediaCount} · ${formatFileSize(summary.withoutMediaBytes)}`}
				tone="warn"
				description="Fichiers seulement dans torrents/ : aucune bibliothèque ne les utilise, ils occupent de la place pour rien"
				rows={report.withoutMedia.map((torrent) => (
					<ReportRow
						key={torrent.hash}
						name={torrent.name}
						cells={[
							torrent.category,
							addedOn(torrent),
							formatFileSize(torrent.sizeBytes),
						]}
					/>
				))}
				emptyText="Aucun."
			/>
			<ReportSection
				title="Jamais téléchargés"
				count={String(summary.neverDownloadedCount)}
				tone="warn"
				description="À 0 % : rien de ces torrents n'est sur le disque"
				rows={report.neverDownloaded.map((torrent) => (
					<ReportRow
						key={torrent.hash}
						name={torrent.name}
						cells={[
							torrent.trackerName,
							torrent.message ?? addedOn(torrent),
							percent(torrent),
						]}
					/>
				))}
				emptyText="Aucun."
			/>
			<ReportSection
				title="Doublons"
				count={String(summary.duplicateCount)}
				tone="warn"
				description="Plusieurs fichiers distincts pour un même film ou épisode : à trier dans la bibliothèque"
				rows={report.duplicates.map((duplicate) => (
					<li
						key={duplicate.label}
						className={styles.duplicate}
					>
						<p className={styles.duplicateLabel}>{duplicate.label}</p>
						<ul className={styles.duplicateFiles}>
							{duplicate.files.map((file) => (
								<ReportRow
									key={file.path}
									name={formatStoragePath(file.path)}
									tag={
										file.quality === null ? null : QUALITY_LABELS[file.quality]
									}
									cells={[
										formatFileSize(file.sizeBytes),
										file.torrentCount === 0
											? "aucun torrent"
											: `${file.torrentCount} torrent${file.torrentCount > 1 ? "s" : ""}`,
									]}
								/>
							))}
						</ul>
					</li>
				))}
				emptyText="Aucun."
			/>
			<ReportSection
				title="Ajoutés par cross-seed"
				count={String(summary.crossSeedAddedCount)}
				tone="accent"
				description="Torrents de l'étiquette cross-seed ajoutés depuis le passage précédent"
				rows={report.crossSeedAdded.map((torrent) => (
					<ReportRow
						key={torrent.hash}
						name={torrent.name}
						cells={[
							torrent.trackerName,
							addedOn(torrent),
							formatFileSize(torrent.sizeBytes),
						]}
					/>
				))}
				emptyText="Aucun."
			/>
		</>
	);
}

function LastRun({
	report,
	job,
}: {
	report: MediaSyncReport | null;
	job: JobItem | undefined;
}) {
	if (job?.status === "running")
		return (
			<span className={styles.lastRun}>
				<StatusDot
					tone="warn"
					label="En cours"
				/>
				En cours…
			</span>
		);
	if (report === null) return null;
	const seconds =
		(Date.parse(report.finishedAt) - Date.parse(report.startedAt)) / 1000;
	const failed = job?.status === "fail";
	return (
		<span className={styles.lastRun}>
			<StatusDot
				tone={failed ? "danger" : "ok"}
				label={failed ? "Échec du dernier passage" : "Réussi"}
			/>
			{`${failed ? "Dernier rapport" : "Dernier passage"} : ${formatDateTime(new Date(report.finishedAt))} · ${formatDuration(seconds)}`}
			{failed
				? " (le passage suivant a échoué : voir son log dans les jobs)"
				: null}
		</span>
	);
}

/**
 * Le rapport du job media-sync (§8, étape 5) : les torrents et leurs trackers, comparés au passage précédent. Il ne fait
 * qu'informer : aucun bouton n'y supprime de torrent ni de fichier. Le détail par média est dans le backlog, en mode
 * connecté
 */
export function MediaReportPage({ consoleVersion, onLogout }: Props) {
	const { data, error, refresh } = usePolling<MediaReportResponse>(
		"/media-report",
		60_000,
	);
	const jobs = usePolling<JobItem[]>("/jobs", 15_000);
	const [request, setRequest] = useState<{ id: string; title: string } | null>(
		null,
	);
	const [runError, setRunError] = useState<string | null>(null);
	const report = data?.report ?? null;
	const job = jobs.data?.find(({ name }) => name === "media-sync");
	const crossSeed =
		report === null ? null : CROSS_SEED_SEARCH_LABELS[report.crossSeedSearch];

	async function rerun(): Promise<void> {
		try {
			const { requestId } = await apiRequest<{ requestId: string }>(
				"/jobs/media-sync/run",
				{
					method: "POST",
					body: {},
				},
			);
			setRunError(null);
			setRequest({ id: requestId, title: "Job · Relevé des médias" });
		} catch (rerunError) {
			setRunError(
				rerunError instanceof Error ? rerunError.message : String(rerunError),
			);
		}
	}

	return (
		<div className={styles.page}>
			<header className={styles.topbar}>
				<a
					className={styles.back}
					href="/"
				>
					<ArrowLeft size={16} />
					<span className={styles.logo}>
						<Castle
							size={16}
							strokeWidth={2.25}
						/>
					</span>
					Console
				</a>
				<span className={styles.version}>{consoleVersion}</span>
				<IconButton
					icon={LogOut}
					label="Se déconnecter"
					size="sm"
					onClick={onLogout}
				/>
			</header>

			<main className={styles.main}>
				<div className={styles.heading}>
					<div>
						<h1 className={styles.title}>Médias</h1>
						<p className={styles.subtitle}>
							media-sync · chaque nuit à 2 h · comparé au passage précédent
						</p>
					</div>
					<div className={styles.actions}>
						<LastRun
							report={report}
							job={job}
						/>
						<ActionButton
							label="Relancer"
							icon={RotateCw}
							variant="primary"
							disabled={request !== null || job?.status === "running"}
							onClick={() => {
								void rerun();
							}}
						/>
					</div>
				</div>
				{error === null ? null : <p className={styles.error}>{error}</p>}
				{runError === null ? null : <p className={styles.error}>{runError}</p>}
				{crossSeed === null ? null : (
					<p className={styles.notice}>{crossSeed}</p>
				)}
				{report === null ? (
					<p className={styles.muted}>
						{data === null
							? "Lecture…"
							: "Aucun rapport pour l'instant : le job media-sync passe chaque nuit à 2 h, ou « Relancer »."}
					</p>
				) : (
					<>
						<Tiles report={report} />
						<Sections report={report} />
					</>
				)}
				<p className={styles.footnote}>
					Le détail par média (taille, qualité, partage, doublon, écarts) est
					dans le backlog des médias, en mode connecté. La console ne garde que
					les torrents et leurs trackers ; rien ne s&apos;y supprime : cela se
					fait dans qBittorrent ou sur le disque.
				</p>
			</main>

			<RequestDialog
				request={request}
				onClose={() => {
					setRequest(null);
					refresh();
					jobs.refresh();
				}}
			/>
		</div>
	);
}
