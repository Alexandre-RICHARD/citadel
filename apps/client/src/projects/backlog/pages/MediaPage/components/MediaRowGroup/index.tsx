import { isTextField } from "@citadel/common/src/browser/dom/isTextField";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { ChevronRight } from "lucide-react";
import {
	type KeyboardEvent,
	memo,
	type MouseEvent,
	type ReactNode,
} from "react";

import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { focusSiblingRow } from "../../../../helper/dom/focusSiblingRow";
import { getLanguageLabel } from "../../../../helper/media/getLanguageLabel";
import { getRowKeyAction } from "../../../../helper/table/getRowKeyAction";
import nasStyles from "../../../../nas.module.scss";
import { ReleaseDateLabel } from "../../../Homepage/components/ReleaseDateLabel";
import type { MediaTableControls } from "../../mediaTableControls.type";
import { JellyfinCollectionNote } from "../JellyfinCollectionNote";
import { MediaActionsCell } from "../MediaActionsCell";
import { MediaDataCell } from "../MediaDataCell";
import { MediaThumbnail } from "../MediaThumbnail";
import { MediaTypeIcon } from "../MediaTypeIcon";
import { NasCell } from "../NasCell";
import { RuntimeCell } from "../RuntimeCell";
import { ShowSeasonRows } from "../ShowSeasonRows";
import { VerifiedCell } from "../VerifiedCell";
import { WatchedCell } from "../WatchedCell";

type Props = {
	row: MediaRowFm;
	columns: ConnectedMediaColumn[];
	cellClassNames: Partial<Record<ConnectedMediaColumn, string>>;
	// Série dépliée : ses saisons suivent, et `expandedSeasonId` dit laquelle montre ses épisodes
	isExpanded: boolean;
	expandedSeasonId: number | null;
	table: MediaTableControls;
};

/**
 * Ligne d'un film ou d'une série, puis, pour une série dépliée, ses saisons et les épisodes de la saison dépliée. Une ligne
 * en attente du serveur est grisée et inerte. Mémorisée : une ligne ne se redessine que si ce qu'elle affiche change
 */
export const MediaRowGroup = memo(function MediaRowGroup({
	row,
	columns,
	cellClassNames,
	isExpanded,
	expandedSeasonId,
	table,
}: Props) {
	const isShow = row.mediaType === MediaTypeEnum.SHOW;
	const isMenuOpen =
		table.popover?.kind === "actionsMenu" &&
		table.popover.userMediaId === row.userMediaId;

	// Le clic droit focalise la ligne et ouvre son menu d'actions ; dans un champ de saisie, le menu du navigateur reste
	function openActionsMenu(event: MouseEvent<HTMLTableRowElement>) {
		if (isTextField(event.target)) return;
		event.preventDefault();
		event.currentTarget.focus({ preventScroll: true });
		table.setPopover({
			kind: "actionsMenu",
			userMediaId: row.userMediaId,
			pointer: { x: event.clientX, y: event.clientY },
		});
	}

	// La ligne elle-même a le focus : ↑ ↓ changent de ligne, Entrée déplie ou replie une série, Suppr retire
	function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
		if (
			event.target !== event.currentTarget ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey
		)
			return;
		const action = getRowKeyAction(event.key, isShow);
		if (action === null) return;
		event.preventDefault();
		if (action === "previousRow")
			focusSiblingRow(event.currentTarget, "previous");
		else if (action === "nextRow") focusSiblingRow(event.currentTarget, "next");
		else if (action === "toggleExpanded")
			table.toggleExpandedShow(row.userMediaId);
		else table.openModal({ kind: "confirmRemoval", row });
	}

	function renderCell(column: ConnectedMediaColumn): ReactNode {
		switch (column) {
			case MediaColumnEnum.THUMBNAIL:
				return <MediaThumbnail path={row.imagePath} />;
			// Le titre français dessus, un peu plus clair et plus épais ; le titre original dessous quand il diffère
			case MediaColumnEnum.TITLE:
				return (
					<span className={styles.nameBlock}>
						<span className={styles.primaryName}>{row.title}</span>
						{row.originalTitle !== null && (
							<span className={styles.secondaryName}>{row.originalTitle}</span>
						)}
					</span>
				);
			case MediaColumnEnum.MEDIA_TYPE:
				return <MediaTypeIcon mediaType={row.mediaType} />;
			case MediaColumnEnum.ORIGINAL_LANGUAGE:
				return row.originalLanguage === null
					? null
					: getLanguageLabel(row.originalLanguage);
			// Un clic sur la saga filtre le tableau sur ses médias, aussi en lecture seule
			// En mode connecté, la collection Jellyfin dessous, signalée quand son nom diffère (§5)
			case MediaColumnEnum.SAGA:
				return (
					<span className={nasStyles.stack}>
						{row.saga !== null && (
							<span className={styles.seriesCell}>
								<Tooltip content="Filtrer sur cette saga">
									<button
										type="button"
										className={styles.seriesButton}
										onClick={() => {
											if (row.saga !== null) table.filterOnSaga(row.saga.name);
										}}
									>
										{row.saga.name}
									</button>
								</Tooltip>
							</span>
						)}
						<JellyfinCollectionNote
							sagaName={row.saga?.name ?? null}
							collection={row.nas?.jellyfinCollection ?? null}
						/>
					</span>
				);
			case MediaColumnEnum.SAGA_NUMBER:
				return row.sagaNumberLabel === null ? null : (
					<span className={styles.number}>{row.sagaNumberLabel}</span>
				);
			case MediaColumnEnum.RELEASE_DATE:
				return (
					<ReleaseDateLabel
						date={row.releaseDate}
						isCancelled={false}
					/>
				);
			case MediaColumnEnum.RUNTIME:
				return (
					<RuntimeCell
						runtimeMinutes={row.runtimeMinutes}
						nas={row.nas}
					/>
				);
			case MediaColumnEnum.IN_PROGRESS:
			case MediaColumnEnum.UP_NEXT:
			case MediaColumnEnum.COMMENT:
				return (
					<MediaDataCell
						column={column}
						row={row}
						table={table}
					/>
				);
			case MediaColumnEnum.WATCHED:
				return (
					<WatchedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={isShow ? { kind: "show" } : null}
						subject={isShow ? "la série" : "le film"}
						isWatched={row.isWatched}
						progress={row.episodeProgress}
						isDisabled={row.isTemporary}
						table={table}
					/>
				);
			case MediaColumnEnum.TMDB_ID:
				return (
					<a
						className={joinClassNames(styles.number, styles.externalLink)}
						href={row.tmdbUrl}
						target="_blank"
						rel="noreferrer"
					>
						{row.tmdbId}
					</a>
				);
			case MediaColumnEnum.ACTIONS:
				return (
					<MediaActionsCell
						row={row}
						table={table}
					/>
				);
			case NasColumnEnum.VERIFIED:
				return (
					<VerifiedCell
						userMediaId={row.userMediaId}
						title={row.title}
						target={isShow ? { kind: "show" } : null}
						subject={isShow ? "la série" : "le film"}
						nas={row.nas}
						isDisabled={row.isTemporary}
						table={table}
					/>
				);
			default:
				return (
					<NasCell
						column={column}
						nas={row.nas}
						mediaType={row.mediaType}
					/>
				);
		}
	}

	return (
		<>
			<tr
				className={joinClassNames(
					styles.gameRow,
					row.isUpNext && styles.upNextRow,
					// Les deux cochées : le jaune l'emporte (il vient après le bleu dans la feuille de style)
					row.isInProgress && styles.inProgressRow,
					isShow && isExpanded && styles.expandedRow,
					row.isTemporary && styles.temporaryRow,
					isMenuOpen && styles.menuOpenRow,
				)}
				inert={row.isTemporary}
				// Focalisable au clic, pas au Tab : les contrôles de la ligne ont déjà le leur
				tabIndex={-1}
				onContextMenu={openActionsMenu}
				onKeyDown={handleRowKeyDown}
			>
				{/* Chevron d'une série, espace vide pour un film */}
				<td className={styles.expandCell}>
					{isShow && (
						<Tooltip
							content="Saisons et épisodes"
							placement="right"
						>
							<button
								type="button"
								className={styles.expandButton}
								aria-expanded={isExpanded}
								aria-label={`${isExpanded ? "Replier" : "Déplier"} : saisons et épisodes de ${row.title}`}
								onClick={() => table.toggleExpandedShow(row.userMediaId)}
								onKeyDown={(event) => {
									// → déplie, ← replie, comme dans une arborescence
									if (
										(event.key === "ArrowRight" && !isExpanded) ||
										(event.key === "ArrowLeft" && isExpanded)
									) {
										event.preventDefault();
										table.toggleExpandedShow(row.userMediaId);
									}
								}}
							>
								<ChevronRight
									className={styles.chevron}
									aria-hidden
								/>
							</button>
						</Tooltip>
					)}
				</td>
				{columns.map((column) => (
					<td
						key={column}
						className={cellClassNames[column]}
					>
						{renderCell(column)}
					</td>
				))}
			</tr>
			{isShow && isExpanded && !row.isTemporary && (
				<ShowSeasonRows
					row={row}
					columns={columns}
					cellClassNames={cellClassNames}
					expandedSeasonId={expandedSeasonId}
					table={table}
				/>
			)}
		</>
	);
});
