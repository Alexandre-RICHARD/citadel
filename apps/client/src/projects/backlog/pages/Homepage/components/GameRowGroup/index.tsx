import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ChevronRight, CornerDownRight, Layers, Pencil } from "lucide-react";
import type { ReactNode } from "react";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { UserVersionRowFm } from "../../../../api/model/userVersionRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import type { TableControls } from "../../tableControls.type";
import { ActionsCell } from "../ActionsCell";
import { CompanyLabel } from "../CompanyLabel";
import { EndingTypeLabel } from "../EndingTypeLabel";
import { PlatformLabel } from "../PlatformLabel";
import { ReleaseDateLabel } from "../ReleaseDateLabel";
import { Thumbnail } from "../Thumbnail";
import { UserVersionDataCell } from "../UserVersionDataCell";

// Colonnes propres au jeu, toujours en lecture seule
const gameInfoRenderers: Partial<
	Record<BacklogColumnEnum, (row: BacklogRowFm) => ReactNode>
> = {
	[BacklogColumnEnum.THUMBNAIL]: (row) => <Thumbnail imageId={row.imageId} />,
	// Nom VF, nom VO en dessous s'il diffère ; ligne à version jouée unique : titre de sa version
	[BacklogColumnEnum.NAME]: (row) => (
		<span className={styles.nameBlock}>
			<span className={styles.primaryName}>{row.frenchName ?? row.name}</span>
			{row.frenchName !== null && (
				<span className={styles.secondaryName}>{row.name}</span>
			)}
			{row.versionTitle !== null && (
				<span className={styles.versionTitle}>
					<Layers aria-hidden />
					{row.versionTitle}
				</span>
			)}
		</span>
	),
	[BacklogColumnEnum.SERIES_NUMBER]: (row) =>
		row.seriesNumberLabel === null ? null : (
			<span className={styles.number}>{row.seriesNumberLabel}</span>
		),
	[BacklogColumnEnum.DEVELOPER]: (row) =>
		row.developer === null ? null : <CompanyLabel company={row.developer} />,
	[BacklogColumnEnum.PUBLISHER]: (row) =>
		row.publisher === null ? null : <CompanyLabel company={row.publisher} />,
	[BacklogColumnEnum.RELEASE_DATE]: (row) => (
		<ReleaseDateLabel
			date={row.releaseDate}
			isCancelled={row.isCancelled}
		/>
	),
	[BacklogColumnEnum.ENDING_TYPE]: (row) => (
		<EndingTypeLabel endingType={row.endingType} />
	),
	[BacklogColumnEnum.PLATFORM]: (row) =>
		row.platform === null ? null : <PlatformLabel platform={row.platform} />,
};

// Colonnes propres à la version de la sous-ligne ; les colonnes du jeu y restent vides
const userVersionInfoRenderers: Partial<
	Record<BacklogColumnEnum, (row: UserVersionRowFm) => ReactNode>
> = {
	[BacklogColumnEnum.THUMBNAIL]: (row) => (
		<Thumbnail
			imageId={row.coverImageId}
			size="sm"
		/>
	),
	[BacklogColumnEnum.NAME]: (row) => (
		<span className={styles.subRowName}>
			<CornerDownRight aria-hidden />
			{row.versionTitle ?? "Version originale"}
		</span>
	),
	[BacklogColumnEnum.SERIES]: () => null,
	[BacklogColumnEnum.SERIES_NUMBER]: () => null,
	[BacklogColumnEnum.DEVELOPER]: () => null,
	[BacklogColumnEnum.PUBLISHER]: () => null,
	[BacklogColumnEnum.RELEASE_DATE]: (row) => (
		<ReleaseDateLabel
			date={row.releaseDate}
			isCancelled={false}
		/>
	),
	[BacklogColumnEnum.ENDING_TYPE]: () => null,
	[BacklogColumnEnum.PLATFORM]: (row) => (
		<PlatformLabel platform={row.platform} />
	),
};

type Props = {
	row: BacklogRowFm;
	columns: BacklogColumnEnum[];
	// Alignement et colonnes collantes
	cellClassNames: Partial<Record<BacklogColumnEnum, string>>;
	isExpanded: boolean;
	table: TableControls;
};

/**
 * Ligne du jeu, puis ses sous-lignes de versions jouées si elle est dépliée. Une ligne ou une sous-ligne en attente du
 * serveur est grisée et inerte
 */
export function GameRowGroup({
	row,
	columns,
	cellClassNames,
	isExpanded,
	table,
}: Props) {
	const { userVersionRows } = row;
	const userVersionCount = userVersionRows.length;
	const isExpandable = userVersionCount > 1;
	const gameName = row.frenchName ?? row.name;
	// Ligne à version jouée unique : ses données se modifient directement sur la ligne du jeu
	const singleUserVersion = isExpandable
		? null
		: (userVersionRows.at(0) ?? null);

	function renderDataCell(
		column: BacklogColumnEnum,
		values: BacklogRowFm | UserVersionRowFm,
		userVersion: UserVersionRowFm | null,
	): ReactNode {
		return (
			<UserVersionDataCell
				column={column}
				values={values}
				userVersion={userVersion}
				gameId={row.gameId}
				gameName={gameName}
				endingType={row.endingType}
				dlcs={row.dlcs}
				table={table}
			/>
		);
	}

	function renderGameCell(column: BacklogColumnEnum): ReactNode {
		const renderInfo = gameInfoRenderers[column];
		if (renderInfo !== undefined) return renderInfo(row);
		// Un clic sur la série filtre le tableau sur ses jeux, aussi en lecture seule ; un crayon : ce n'est pas celle d'IGDB
		if (column === BacklogColumnEnum.SERIES) {
			const { series, proposedSeries } = row;
			if (series === null) return null;
			const modifiedLabel = `Série modifiée ; IGDB propose : ${proposedSeries?.name ?? "aucune"}`;
			return (
				<span className={styles.seriesCell}>
					<Tooltip content="Filtrer sur cette série">
						<button
							type="button"
							className={styles.seriesButton}
							onClick={() => table.filterOnSeries(series.name)}
						>
							{series.name}
						</button>
					</Tooltip>
					{series.id !== proposedSeries?.id && (
						<Tooltip content={modifiedLabel}>
							<span
								className={styles.modifiedMark}
								role="img"
								aria-label={modifiedLabel}
							>
								<Pencil aria-hidden />
							</span>
						</Tooltip>
					)}
				</span>
			);
		}
		if (column === BacklogColumnEnum.ACTIONS)
			return (
				<ActionsCell
					row={row}
					userVersion={null}
					table={table}
				/>
			);
		return renderDataCell(column, row, singleUserVersion);
	}

	function renderUserVersionCell(
		column: BacklogColumnEnum,
		userVersionRow: UserVersionRowFm,
	): ReactNode {
		const renderInfo = userVersionInfoRenderers[column];
		if (renderInfo !== undefined) return renderInfo(userVersionRow);
		if (column === BacklogColumnEnum.ACTIONS)
			return (
				<ActionsCell
					row={row}
					userVersion={userVersionRow}
					table={table}
				/>
			);
		return renderDataCell(column, userVersionRow, userVersionRow);
	}

	return (
		<>
			<tr
				className={joinClassNames(
					styles.gameRow,
					row.isUpNext && styles.upNextRow,
					isExpandable && isExpanded && styles.expandedRow,
					row.isTemporary && styles.temporaryRow,
				)}
				inert={row.isTemporary}
			>
				{/* Chevron et badge du nombre de versions jouées sur une ligne dépliable, espace vide sur une ligne simple */}
				<td className={styles.expandCell}>
					{isExpandable && (
						<Tooltip
							content={`${userVersionCount} versions jouées`}
							placement="right"
						>
							<button
								type="button"
								className={styles.expandButton}
								aria-expanded={isExpanded}
								aria-label={`${isExpanded ? "Replier" : "Déplier"} : ${userVersionCount} versions jouées`}
								onClick={() => table.toggleExpanded(row.gameId)}
								onKeyDown={(event) => {
									// → déplie, ← replie, comme dans une arborescence
									if (
										(event.key === "ArrowRight" && !isExpanded) ||
										(event.key === "ArrowLeft" && isExpanded)
									) {
										event.preventDefault();
										table.toggleExpanded(row.gameId);
									}
								}}
							>
								<ChevronRight
									className={styles.chevron}
									aria-hidden
								/>
								<span className={styles.versionCount}>{userVersionCount}</span>
							</button>
						</Tooltip>
					)}
				</td>
				{columns.map((column) => (
					<td
						key={column}
						className={cellClassNames[column]}
					>
						{renderGameCell(column)}
					</td>
				))}
			</tr>
			{isExpandable &&
				isExpanded &&
				userVersionRows.map((userVersionRow, index) => (
					<tr
						key={userVersionRow.userVersionId}
						className={joinClassNames(
							styles.userVersionRow,
							index === userVersionCount - 1 && styles.lastUserVersionRow,
							userVersionRow.isTemporary && styles.temporaryRow,
						)}
						inert={userVersionRow.isTemporary}
					>
						<td className={styles.expandCell} />
						{columns.map((column) => (
							<td
								key={column}
								className={cellClassNames[column]}
							>
								{renderUserVersionCell(column, userVersionRow)}
							</td>
						))}
					</tr>
				))}
		</>
	);
}
