import { formatShortIsoDate } from "@citadel/common/src/universal/date/formatShortIsoDate";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { ExternalLink } from "lucide-react";

import type { MediaPreviewFm } from "../../../../api/model/media/mediaPreviewFm.type";
import styles from "../../../../backlog.module.scss";
import { formatDuration } from "../../../../helper/format/formatDuration";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import { getLanguageLabel } from "../../../../helper/media/getLanguageLabel";
import mediaStyles from "../../../../media.module.scss";
import { ReleaseDateLabel } from "../../../Homepage/components/ReleaseDateLabel";
import { SectionTitle } from "../../../Homepage/components/SectionTitle";
import { MediaThumbnail } from "../MediaThumbnail";

type Props = {
	preview: MediaPreviewFm;
};

/**
 * Fiche d'un film ou d'une série, en lecture seule, telle que TMDB la donne. Une série entre avec toutes ses saisons et tous
 * ses épisodes, sans choix possible (§7.1) : la fiche les montre, pour confirmer que c'est la bonne série
 */
export function MediaPreview({ preview }: Props) {
	const isShow = preview.mediaType === MediaTypeEnum.SHOW;
	const episodeCount = preview.seasons
		.filter(({ isSpecials }) => !isSpecials)
		.reduce((count, { episodes }) => count + episodes.length, 0);

	return (
		<div className={styles.preview}>
			<section className={styles.previewHero}>
				<MediaThumbnail
					path={preview.posterPath}
					size="xl"
				/>
				<div className={styles.previewHeading}>
					<p className={styles.previewName}>{preview.title}</p>
					{preview.originalTitle !== null && (
						<p className={styles.secondaryName}>{preview.originalTitle}</p>
					)}
					<p className={styles.previewMeta}>
						<ReleaseDateLabel
							date={preview.releaseDate}
							isCancelled={false}
						/>
						<a
							className={styles.externalLink}
							href={preview.tmdbUrl}
							target="_blank"
							rel="noreferrer"
						>
							TMDB
							<ExternalLink aria-hidden />
						</a>
					</p>
				</div>
			</section>

			<dl className={styles.facts}>
				<div className={styles.fact}>
					<dt>Type</dt>
					<dd>{mediaTypeLabels[preview.mediaType]}</dd>
				</div>
				<div className={styles.fact}>
					<dt>Langue originale</dt>
					<dd>
						{preview.originalLanguage === null
							? "—"
							: getLanguageLabel(preview.originalLanguage)}
					</dd>
				</div>
				{isShow ? (
					<div className={styles.fact}>
						<dt>Diffusion</dt>
						<dd>{preview.isOngoing ? "En cours" : "Terminée"}</dd>
					</div>
				) : (
					<>
						<div className={styles.fact}>
							<dt>Durée</dt>
							<dd>
								{preview.runtimeMinutes === null
									? "—"
									: formatDuration(preview.runtimeMinutes)}
							</dd>
						</div>
						<div className={styles.fact}>
							<dt>Collection TMDB</dt>
							<dd>{preview.collectionName ?? "—"}</dd>
						</div>
					</>
				)}
			</dl>

			{isShow && (
				<section>
					<SectionTitle
						count={`${preview.seasons.filter(({ isSpecials }) => !isSpecials).length} saisons · ${episodeCount} épisodes`}
					>
						Saisons et épisodes, tous ajoutés
					</SectionTitle>
					{preview.seasons.length === 0 ? (
						<p className={styles.emptyHint}>Aucune saison sur TMDB</p>
					) : (
						<ul className={mediaStyles.seasonSummary}>
							{preview.seasons.map((season) => (
								<li key={season.seasonNumber}>
									<details className={mediaStyles.seasonDetails}>
										<summary>
											{season.isSpecials ? "Épisodes spéciaux" : season.name} ·{" "}
											{season.episodes.length} épisodes
											{season.airDate !== null &&
												` · ${formatShortIsoDate(season.airDate)}`}
										</summary>
										<ol className={mediaStyles.episodeList}>
											{season.episodes.map((episode) => (
												<li key={episode.episodeNumber}>
													E{episode.episodeNumber} · {episode.name}
													{episode.airDate === null
														? " · date inconnue"
														: ` · ${formatShortIsoDate(episode.airDate)}`}
												</li>
											))}
										</ol>
									</details>
								</li>
							))}
						</ul>
					)}
				</section>
			)}
		</div>
	);
}
