import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { ChevronRight, CircleAlert, CornerDownRight } from "lucide-react";
import type { ReactNode } from "react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import { useShowSeasons } from "../../../../api/media/useShowSeasons";
import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import type { ShowEpisodeFm } from "../../../../api/model/media/showEpisodeFm.type";
import type { ShowSeasonFm } from "../../../../api/model/media/showSeasonFm.type";
import styles from "../../../../backlog.module.scss";
import { Spinner } from "../../../../components/Spinner";
import { Tooltip } from "../../../../components/Tooltip";
import { isNasColumn } from "../../../../helper/view/isNasColumn";
import mediaStyles from "../../../../media.module.scss";
import { ReleaseDateLabel } from "../../../Homepage/components/ReleaseDateLabel";
import type { MediaTableControls } from "../../mediaTableControls.type";
import { useMediaMode } from "../../useMediaMode";
import { MediaThumbnail } from "../MediaThumbnail";
import { NasCell } from "../NasCell";
import { RuntimeCell } from "../RuntimeCell";
import { VerifiedCell } from "../VerifiedCell";
import { WatchedCell } from "../WatchedCell";

type Props = {
	row: MediaRowFm;
	columns: ConnectedMediaColumn[];
	cellClassNames: Partial<Record<ConnectedMediaColumn, string>>;
	expandedSeasonId: number | null;
	table: MediaTableControls;
};

/**
 * Sous-lignes d'une série dépliée : une par saison, les épisodes spéciaux à la fin, puis les épisodes de la saison
 * dépliée. Une série d'une seule saison montre directement ses épisodes. Lues au dépliage, sans suspendre le tableau
 */
export function ShowSeasonRows({
	row,
	columns,
	cellClassNames,
	expandedSeasonId,
	table,
}: Props) {
	const { seasons, error } = useShowSeasons(
		row.userMediaId,
		useMediaMode().nas !== null,
	);
	const isEditable = !row.isTemporary;

	if (seasons === undefined)
		return (
			<tr
				className={joinClassNames(styles.userVersionRow, mediaStyles.statusRow)}
			>
				<td className={styles.expandCell} />
				<td colSpan={columns.length}>
					{error === null ? (
						<span className={styles.inlineStatus}>
							<Spinner />
							Chargement des saisons…
						</span>
					) : (
						<span className={styles.inlineStatus}>
							<CircleAlert aria-hidden />
							{buildFailureMessage(
								"charger les saisons",
								getErrorReason(error, { projectReasons: backlogErrorReasons }),
							)}
						</span>
					)}
				</td>
			</tr>
		);

	function renderSeasonCell(
		column: ConnectedMediaColumn,
		season: ShowSeasonFm,
	): ReactNode {
		switch (column) {
			case MediaColumnEnum.THUMBNAIL:
				return (
					<MediaThumbnail
						path={season.posterPath}
						size="sm"
					/>
				);
			case MediaColumnEnum.TITLE:
				return (
					<span className={mediaStyles.seasonName}>
						<CornerDownRight aria-hidden />
						{season.isSpecials ? "Épisodes spéciaux" : season.name}
					</span>
				);
			case MediaColumnEnum.RELEASE_DATE:
				return season.airDate === null ? null : (
					<ReleaseDateLabel
						date={season.airDate}
						isCancelled={false}
					/>
				);
			case MediaColumnEnum.RUNTIME:
				return (
					<RuntimeCell
						runtimeMinutes={season.runtimeMinutes}
						nas={season.nas}
					/>
				);
			case MediaColumnEnum.WATCHED:
				return (
					<WatchedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={{ kind: "season", seasonId: season.seasonId }}
						subject={season.isSpecials ? "Épisodes spéciaux" : season.name}
						isWatched={season.isWatched}
						progress={{
							watchedCount: season.watchedEpisodeCount,
							airedCount: season.airedEpisodeCount,
						}}
						isDisabled={!isEditable}
						table={table}
					/>
				);
			case NasColumnEnum.VERIFIED:
				return (
					<VerifiedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={{ kind: "season", seasonId: season.seasonId }}
						subject={season.name}
						nas={season.nas}
						isDisabled={!isEditable}
						table={table}
					/>
				);
			default:
				return isNasColumn(column) ? (
					<NasCell
						column={column}
						nas={season.nas}
						mediaType={row.mediaType}
					/>
				) : null;
		}
	}

	function renderEpisodeCell(
		column: ConnectedMediaColumn,
		episode: ShowEpisodeFm,
	): ReactNode {
		switch (column) {
			case MediaColumnEnum.THUMBNAIL:
				return (
					<MediaThumbnail
						path={episode.stillPath}
						size="still"
					/>
				);
			case MediaColumnEnum.TITLE:
				return (
					<span
						className={joinClassNames(
							mediaStyles.episodeName,
							!episode.isAired && mediaStyles.unaired,
						)}
					>
						<span className={mediaStyles.episodeNumber}>
							E{episode.episodeNumber}
						</span>
						{episode.name}
					</span>
				);
			case MediaColumnEnum.RELEASE_DATE:
				return (
					<ReleaseDateLabel
						date={episode.airDate}
						isCancelled={false}
					/>
				);
			case MediaColumnEnum.RUNTIME:
				return (
					<RuntimeCell
						runtimeMinutes={episode.runtimeMinutes}
						nas={episode.nas}
					/>
				);
			case MediaColumnEnum.WATCHED:
				return (
					<WatchedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={{ kind: "episode", episodeId: episode.episodeId }}
						subject={`l’épisode ${episode.episodeNumber}`}
						isWatched={episode.isWatched}
						progress={null}
						isDisabled={!isEditable}
						table={table}
					/>
				);
			case NasColumnEnum.VERIFIED:
				return (
					<VerifiedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={{ kind: "episode", episodeId: episode.episodeId }}
						subject={`l’épisode ${episode.episodeNumber}`}
						nas={episode.nas}
						isDisabled={!isEditable}
						table={table}
					/>
				);
			default:
				return isNasColumn(column) ? (
					<NasCell
						column={column}
						nas={episode.nas}
						mediaType={row.mediaType}
					/>
				) : null;
		}
	}

	return seasons.map((season, seasonIndex) => {
		const isOnlySeason = seasons.length === 1;
		const isExpanded = isOnlySeason || season.seasonId === expandedSeasonId;
		const episodeCount = season.episodes.length;
		const isLastSeason = seasonIndex === seasons.length - 1;
		return [
			<tr
				key={`season-${season.seasonId}`}
				className={joinClassNames(
					styles.userVersionRow,
					isLastSeason && !isExpanded && styles.lastUserVersionRow,
				)}
				tabIndex={-1}
			>
				<td className={styles.expandCell}>
					{!isOnlySeason && episodeCount > 0 && (
						<Tooltip
							content={`${episodeCount} épisodes`}
							placement="right"
						>
							<button
								type="button"
								className={styles.expandButton}
								aria-expanded={isExpanded}
								aria-label={`${isExpanded ? "Replier" : "Déplier"} : ${season.name}, ${episodeCount} épisodes`}
								onClick={() => table.toggleExpandedSeason(season.seasonId)}
							>
								<ChevronRight
									className={styles.chevron}
									aria-hidden
								/>
								<span className={styles.versionCount}>{episodeCount}</span>
							</button>
						</Tooltip>
					)}
				</td>
				{columns.map((column) => (
					<td
						key={column}
						className={cellClassNames[column]}
					>
						{renderSeasonCell(column, season)}
					</td>
				))}
			</tr>,
			...(isExpanded
				? season.episodes.map((episode, episodeIndex) => (
						<tr
							key={`episode-${episode.episodeId}`}
							className={joinClassNames(
								styles.userVersionRow,
								mediaStyles.episodeRow,
								isLastSeason &&
									episodeIndex === episodeCount - 1 &&
									styles.lastUserVersionRow,
							)}
							tabIndex={-1}
						>
							<td className={styles.expandCell} />
							{columns.map((column) => (
								<td
									key={column}
									className={cellClassNames[column]}
								>
									{renderEpisodeCell(column, episode)}
								</td>
							))}
						</tr>
					))
				: []),
		];
	});
}
