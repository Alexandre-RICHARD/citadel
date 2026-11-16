import { pluralize } from "@citadel/common/src/universal/string/pluralize";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { BacklogErrorCodeEnum } from "@citadel/specs/src/projects/backlog/error/backlogErrorCode.enum";
import { Check, FileUp, X } from "lucide-react";
import { useState } from "react";

import { useCancelMediaImport } from "../../../../api/media/useCancelMediaImport";
import { useMediaImport } from "../../../../api/media/useMediaImport";
import { useStartMediaImport } from "../../../../api/media/useStartMediaImport";
import { useValidateMediaImport } from "../../../../api/media/useValidateMediaImport";
import type { MediaImportFm } from "../../../../api/model/media/mediaImportFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import { mediaImportRejectionLabels } from "../../../../helper/label/mediaImportRejectionLabels";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import { decodeCsvText } from "../../../../helper/media/decodeCsvText";
import type { MediaImportCsv } from "../../../../helper/media/mediaImportCsv.type";
import { parseMediaImportCsv } from "../../../../helper/media/parseMediaImportCsv";
import mediaStyles from "../../../../media.module.scss";
import { FormField } from "../../../Homepage/components/FormField";
import { LoadingState } from "../../../Homepage/components/LoadingState";
import { SectionTitle } from "../../../Homepage/components/SectionTitle";
import { MediaThumbnail } from "../MediaThumbnail";
import { MediaTypeIcon } from "../MediaTypeIcon";

type Props = {
	onClose: () => void;
};

function countType(csv: MediaImportCsv, mediaType: MediaTypeEnum): number {
	return csv.entries.filter((entry) => entry.mediaType === mediaType).length;
}

// La lecture en cours : sa progression, qui continue sur le serveur même la fenêtre fermée
function ReadingProgress({ mediaImport }: { mediaImport: MediaImportFm }) {
	const percent =
		mediaImport.totalCount === 0
			? 0
			: Math.round((mediaImport.readCount / mediaImport.totalCount) * 100);
	return (
		<div className={styles.formStack}>
			<p className={styles.modalIntro}>
				Lecture des fiches sur TMDB : {mediaImport.readCount} /{" "}
				{mediaImport.totalCount}. Elle continue sur le serveur si vous fermez
				cette fenêtre ; rien n’est enregistré avant « Valider ».
			</p>
			<div
				className={mediaStyles.progressTrack}
				role="progressbar"
				aria-label="Lecture des fiches"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={percent}
			>
				<div
					className={mediaStyles.progressFill}
					style={{ width: `${percent}%` }}
				/>
			</div>
		</div>
	);
}

// L'aperçu : une ligne par média reconnu, et ceux qui ne le sont pas, avec la raison
function ImportPreview({ mediaImport }: { mediaImport: MediaImportFm }) {
	return (
		<div className={styles.formStack}>
			<section>
				<SectionTitle count={String(mediaImport.recognized.length)}>
					Entreront au backlog
				</SectionTitle>
				{mediaImport.recognized.length === 0 ? (
					<p className={styles.emptyHint}>Aucun média reconnu</p>
				) : (
					<ul className={mediaStyles.mediaList}>
						{mediaImport.recognized.map((media) => (
							<li
								key={`${media.mediaType}-${media.tmdbId}`}
								className={mediaStyles.mediaListItem}
							>
								<MediaThumbnail
									path={media.posterPath}
									size="sm"
								/>
								<span className={mediaStyles.mediaListText}>
									<span className={styles.primaryName}>{media.title}</span>
									<span className={mediaStyles.mediaListMeta}>
										{mediaTypeLabels[media.mediaType]}
										{media.releaseYear !== null && ` · ${media.releaseYear}`}
									</span>
								</span>
								<MediaTypeIcon mediaType={media.mediaType} />
							</li>
						))}
					</ul>
				)}
			</section>
			{mediaImport.rejected.length > 0 && (
				<section>
					<SectionTitle count={String(mediaImport.rejected.length)}>
						Ne seront pas repris
					</SectionTitle>
					<ul className={mediaStyles.lineList}>
						{mediaImport.rejected.map((media, index) => (
							<li
								// Un même identifiant peut revenir (doublon) : la place dans la liste le distingue
								// eslint-disable-next-line react/no-array-index-key -- liste figée, jamais réordonnée
								key={`${media.mediaType}-${media.tmdbId}-${index}`}
							>
								{mediaTypeLabels[media.mediaType]} {media.tmdbId} :{" "}
								{mediaImportRejectionLabels[media.reason]}
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	);
}

/**
 * Import de liste (§7.2) : un fichier CSV de deux colonnes, l'identifiant TMDB et le type (film ou série). Le fichier se lit
 * dans le navigateur, le serveur lit ensuite les fiches sur TMDB à son rythme, puis l'aperçu attend « Valider ». Chaque
 * média entre avec les valeurs par défaut ; tout se règle ensuite à la main. Un import déjà lancé se retrouve à la réouverture
 */
export function ImportMediaModal({ onClose }: Props) {
	const [csv, setCsv] = useState<MediaImportCsv | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const mediaImport = useMediaImport(true);
	const startMediaImport = useStartMediaImport();
	const validateMediaImport = useValidateMediaImport();
	const cancelMediaImport = useCancelMediaImport();
	const current = mediaImport.data;
	const hasNoImport =
		current === undefined &&
		mediaImport.error?.code === BacklogErrorCodeEnum.MEDIA_IMPORT_NOT_FOUND;

	async function readFile(file: File): Promise<void> {
		setFileName(file.name);
		setCsv(parseMediaImportCsv(decodeCsvText(await file.arrayBuffer())));
	}

	let body;
	let actions;
	if (current === undefined && !hasNoImport) {
		body = (
			<LoadingState
				error={mediaImport.error}
				actionLabel="lire l'import en cours"
			>
				Recherche d’un import en cours…
			</LoadingState>
		);
		actions = <Button onClick={onClose}>Fermer</Button>;
	} else if (current === undefined) {
		body = (
			<div className={styles.formStack}>
				<p className={styles.modalIntro}>
					Un fichier CSV de deux colonnes : l’identifiant TMDB et le type (film
					ou série), une ligne par média. Chacun entre avec sa première affiche
					TMDB, sans saga, rien de vu ; tout se règle ensuite à la main.
				</p>
				<FormField label="Fichier CSV">
					<input
						type="file"
						accept=".csv,.txt,text/csv,text/plain"
						className={mediaStyles.fileInput}
						onChange={(event) => {
							const file = event.target.files?.item(0);
							if (file !== null && file !== undefined) void readFile(file);
						}}
					/>
				</FormField>
				{csv !== null && (
					<Callout tone={csv.entries.length === 0 ? "danger" : "info"}>
						{fileName} : {pluralize(csv.entries.length, "ligne")} lisible
						{csv.entries.length > 1 ? "s" : ""} (
						{pluralize(countType(csv, MediaTypeEnum.MOVIE), "film")},{" "}
						{countType(csv, MediaTypeEnum.SHOW)} série
						{countType(csv, MediaTypeEnum.SHOW) > 1 ? "s" : ""}).
					</Callout>
				)}
				{csv !== null && csv.invalidLines.length > 0 && (
					<section>
						<SectionTitle count={String(csv.invalidLines.length)}>
							Lignes illisibles, ignorées
						</SectionTitle>
						<ul className={mediaStyles.lineList}>
							{csv.invalidLines.map(({ lineNumber, text }) => (
								<li key={lineNumber}>
									Ligne {lineNumber} : {text}
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		);
		actions = (
			<>
				<Button onClick={onClose}>Annuler</Button>
				<Button
					variant="primary"
					icon={FileUp}
					disabled={csv === null || csv.entries.length === 0}
					onClick={() => {
						if (csv !== null) startMediaImport.mutate({ entries: csv.entries });
					}}
				>
					Lire les fiches sur TMDB
				</Button>
			</>
		);
	} else if (current.status === MediaImportStatusEnum.READING) {
		body = <ReadingProgress mediaImport={current} />;
		actions = (
			<>
				<Button
					icon={X}
					onClick={() => cancelMediaImport.mutate()}
				>
					Annuler l’import
				</Button>
				<Button
					variant="primary"
					onClick={onClose}
				>
					Fermer
				</Button>
			</>
		);
	} else if (current.status === MediaImportStatusEnum.FAILED) {
		body = (
			<Callout tone="danger">
				TMDB a cessé de répondre pendant la lecture : rien n’a été enregistré.
				Abandonnez cet import, puis relancez-le.
			</Callout>
		);
		actions = (
			<Button
				variant="primary"
				icon={X}
				onClick={() => cancelMediaImport.mutate()}
			>
				Abandonner l’import
			</Button>
		);
	} else {
		body = <ImportPreview mediaImport={current} />;
		actions = (
			<>
				<Button
					icon={X}
					onClick={() => {
						cancelMediaImport.mutate();
						onClose();
					}}
				>
					Annuler l’import
				</Button>
				<Button
					variant="primary"
					icon={Check}
					disabled={current.recognized.length === 0}
					onClick={() => {
						validateMediaImport.mutate();
						onClose();
					}}
				>
					Ajouter {pluralize(current.recognized.length, "média")}
				</Button>
			</>
		);
	}

	return (
		<Modal
			title="Importer une liste"
			subtitle="Films et séries, par leur identifiant TMDB"
			icon={FileUp}
			size="lg"
			actions={actions}
			onClose={onClose}
		>
			{body}
		</Modal>
	);
}
