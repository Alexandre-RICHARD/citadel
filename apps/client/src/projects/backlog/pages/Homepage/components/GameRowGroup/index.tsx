import { isTextField } from "@citadel/common/src/browser/dom/isTextField";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ChevronRight, CornerDownRight, Layers, Pencil } from "lucide-react";
import {
	type KeyboardEvent,
	memo,
	type MouseEvent,
	type ReactNode,
} from "react";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { UserVersionRowFm } from "../../../../api/model/userVersionRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { focusSiblingRow } from "../../../../helper/dom/focusSiblingRow";
import { getRowKeyAction } from "../../../../helper/table/getRowKeyAction";
import { ActionsCell } from "../ActionsCell";
import { CompanyLabel } from "../CompanyLabel";
import { EndingTypeCell } from "../EndingTypeCell";
import { PlatformLabel } from "../PlatformLabel";
import { ReleaseDateLabel } from "../ReleaseDateLabel";
import { Thumbnail } from "../Thumbnail";
import { UserVersionDataCell } from "../UserVersionDataCell";
import { areGameRowGroupPropsEqual } from "./areGameRowGroupPropsEqual";
import type { GameRowGroupProps } from "./gameRowGroupProps.type";

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

/**
 * Ligne du jeu, puis ses sous-lignes de versions jouées si elle est dépliée. Une ligne ou une sous-ligne en attente du
 * serveur est grisée et inerte. Mémorisée : une ligne ne se redessine que si ce qu'elle affiche change
 */
export const GameRowGroup = memo(function GameRowGroup({
	row,
	columns,
	cellClassNames,
	isExpanded,
	table,
}: GameRowGroupProps) {
	const { userVersionRows } = row;
	const userVersionCount = userVersionRows.length;
	const isExpandable = userVersionCount > 1;
	const gameName = row.frenchName ?? row.name;
	function isActionsMenuOpenOn(userVersionId: number | null): boolean {
		return (
			table.popover?.kind === "actionsMenu" &&
			table.popover.gameId === row.gameId &&
			table.popover.userVersionId === userVersionId
		);
	}
	// Ligne à version jouée unique : ses données se modifient directement sur la ligne du jeu
	const singleUserVersion = isExpandable
		? null
		: (userVersionRows.at(0) ?? null);

	// Le clic droit focalise la ligne et ouvre son menu d'actions ; dans un champ de saisie, le menu du navigateur reste
	function openActionsMenu(
		event: MouseEvent<HTMLTableRowElement>,
		userVersionId: number | null,
	) {
		if (isTextField(event.target)) return;
		event.preventDefault();
		event.currentTarget.focus({ preventScroll: true });
		table.setPopover({
			kind: "actionsMenu",
			gameId: row.gameId,
			userVersionId,
			pointer: { x: event.clientX, y: event.clientY },
		});
	}

	// La ligne elle-même a le focus (pas un contrôle à l'intérieur) : ↑ ↓ changent de ligne, Entrée déplie ou replie, Suppr retire
	function handleRowKeyDown(
		event: KeyboardEvent<HTMLTableRowElement>,
		userVersion: UserVersionRowFm | null,
	) {
		if (
			event.target !== event.currentTarget ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey
		)
			return;
		const action = getRowKeyAction(
			event.key,
			userVersion === null && isExpandable,
		);
		if (action === null) return;
		event.preventDefault();
		if (action === "previousRow")
			focusSiblingRow(event.currentTarget, "previous");
		else if (action === "nextRow") focusSiblingRow(event.currentTarget, "next");
		else if (action === "toggleExpanded") table.toggleExpanded(row.gameId);
		else
			table.openModal({
				kind: "confirmRemoval",
				gameId: row.gameId,
				gameName,
				userVersionId: userVersion?.userVersionId ?? null,
				platformName: userVersion?.platform.shortName ?? null,
				userVersionCount,
			});
	}

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
		if (column === BacklogColumnEnum.ENDING_TYPE)
			return (
				<EndingTypeCell
					row={row}
					table={table}
				/>
			);
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
					// Les deux cochées : le jaune l'emporte (il vient après le bleu dans la feuille de style)
					row.isInProgress && styles.inProgressRow,
					isExpandable && isExpanded && styles.expandedRow,
					row.isTemporary && styles.temporaryRow,
					isActionsMenuOpenOn(null) && styles.menuOpenRow,
				)}
				inert={row.isTemporary}
				// Focalisable au clic, pas au Tab : les contrôles de la ligne ont déjà le leur
				tabIndex={-1}
				// Ligne à version jouée unique : le menu du jeu ; ligne dépliable : celui du jeu aussi, les versions ont leurs sous-lignes
				onContextMenu={(event) => openActionsMenu(event, null)}
				onKeyDown={(event) => handleRowKeyDown(event, null)}
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
							isActionsMenuOpenOn(userVersionRow.userVersionId) &&
								styles.menuOpenRow,
						)}
						inert={userVersionRow.isTemporary}
						tabIndex={-1}
						onKeyDown={(event) => handleRowKeyDown(event, userVersionRow)}
						onContextMenu={(event) =>
							openActionsMenu(event, userVersionRow.userVersionId)
						}
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
}, areGameRowGroupPropsEqual);
