import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { FunnelX, Gamepad2, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { ClearFiltersCell } from "../../../../components/ClearFiltersCell";
import { Spinner } from "../../../../components/Spinner";
import { TableCaptionStatus } from "../../../../components/TableCaptionStatus";
import { useLoadMoreOnScroll } from "../../../../hooks/useLoadMoreOnScroll";
import { getColumnClassNames } from "../../getColumnClassNames";
import type { TableControls } from "../../tableControls.type";
import type { TableSettings } from "../../tableSettings.type";
import { ColumnFilterCell } from "../ColumnFilterCell";
import { GameColumnHeader } from "../GameColumnHeader";
import { GameRowGroup } from "../GameRowGroup";
import { PlayTimeRecap } from "../PlayTimeRecap";
import { ScrollTopButton } from "../ScrollTopButton";

type Props = {
	rows: BacklogRowFm[];
	// Jeux qui correspondent aux filtres, toutes pages confondues
	matchedCount: number;
	hasNextPage: boolean;
	onLoadNextPage: () => void;
	// La vue vient de changer : les lignes affichées restent celles de la précédente, le temps de lire la nouvelle
	isStale: boolean;
	settings: TableSettings;
	table: TableControls;
};

// Le tableau du backlog : en-têtes triables, ligne des filtres, lignes par pages de 25
export function BacklogTable({
	rows,
	matchedCount,
	hasNextPage,
	onLoadNextPage,
	isStale,
	settings,
	table,
}: Props) {
	const {
		columns,
		view,
		overview,
		expandedGameIds,
		onToggleSort,
		onFilterChange,
		onFilterModeChange,
		onClearFilters,
		onFocusSearch,
	} = settings;
	const { filters } = view;
	// Mêmes objets tant que les colonnes ne changent pas : les lignes mémorisées les comparent par identité
	const visibleColumns = useMemo(
		() => columns.filter(({ isVisible }) => isVisible).map(({ key }) => key),
		[columns],
	);
	const headerClassNames = useMemo(
		() => getColumnClassNames(visibleColumns, true),
		[visibleColumns],
	);
	const cellClassNames = useMemo(
		() => getColumnClassNames(visibleColumns, false),
		[visibleColumns],
	);
	const loadMoreRef = useLoadMoreOnScroll(
		hasNextPage,
		rows.length,
		onLoadNextPage,
	);
	// Les bornes des nombres et des dates sont des champs libres : effacer les filtres recrée la ligne pour les vider
	const [filterRowKey, setFilterRowKey] = useState(0);
	const platformNames = (overview?.playedPlatforms ?? []).map(
		({ shortName }) => shortName,
	);
	const gameCount = overview?.gameCount ?? matchedCount;
	const userVersionCount = overview?.userVersionCount ?? 0;

	function clearFilters() {
		setFilterRowKey((key) => key + 1);
		onClearFilters();
	}

	return (
		<div className={styles.tableArea}>
			{/* Résumé du backlog, calé à gauche même quand la page défile en largeur */}
			<div className={styles.tableCaption}>
				<span className={styles.captionCount}>
					{filters.length > 0 ? (
						<>
							<strong>{matchedCount}</strong>{" "}
							{matchedCount > 1 ? "jeux" : "jeu"} sur {gameCount}
						</>
					) : (
						<>
							<strong>{gameCount}</strong> {gameCount > 1 ? "jeux" : "jeu"}
							<span className={styles.captionSeparator}>·</span>
							<strong>{userVersionCount}</strong>{" "}
							{userVersionCount > 1 ? "versions" : "version"}
							{overview !== null && (
								<>
									<span className={styles.captionSeparator}>·</span>
									<strong>{overview.finishedGameCount}</strong>{" "}
									{overview.finishedGameCount > 1 ? "jeux finis" : "jeu fini"}
									<span className={styles.captionSeparator}>·</span>
									<PlayTimeRecap
										trackedPlayTimeMinutes={overview.trackedPlayTimeMinutes}
										estimatedPlayTimeMinutes={overview.estimatedPlayTimeMinutes}
									/>
								</>
							)}
						</>
					)}
				</span>
				<TableCaptionStatus
					filterCount={filters.length}
					filterMode={view.filterMode}
					isStale={isStale}
					isEditMode={table.isEditMode}
					onFilterModeChange={onFilterModeChange}
					onClearFilters={clearFilters}
				/>
			</div>
			<table
				className={joinClassNames(
					styles.table,
					table.isEditMode && styles.editingTable,
				)}
				aria-label="Backlog"
				aria-busy={isStale}
				data-backlog-table
			>
				<thead>
					<tr className={styles.headerRow}>
						<th
							className={styles.expandCell}
							aria-label="Versions jouées"
						>
							<ScrollTopButton />
						</th>
						{visibleColumns.map((column) => (
							<GameColumnHeader
								key={column}
								column={column}
								sort={view.sort}
								className={headerClassNames[column]}
								onToggleSort={onToggleSort}
							/>
						))}
					</tr>
					<tr
						key={filterRowKey}
						className={styles.filterRow}
					>
						<ClearFiltersCell
							hasFilters={filters.length > 0}
							onClearFilters={clearFilters}
						/>
						{visibleColumns.map((column) => (
							<th
								key={column}
								className={cellClassNames[column]}
							>
								<ColumnFilterCell
									column={column}
									filter={
										filters.find((filter) => filter.column === column) ?? null
									}
									platformNames={platformNames}
									onChange={(filter) => onFilterChange(column, filter)}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody className={joinClassNames(isStale && styles.staleRows)}>
					{rows.map((row) => (
						<GameRowGroup
							key={row.gameId}
							row={row}
							columns={visibleColumns}
							cellClassNames={cellClassNames}
							isExpanded={expandedGameIds.includes(row.gameId)}
							table={table}
						/>
					))}
				</tbody>
			</table>
			{rows.length === 0 && (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}>
						{filters.length > 0 ? (
							<SearchX aria-hidden />
						) : (
							<Gamepad2 aria-hidden />
						)}
					</span>
					{filters.length > 0 ? (
						<>
							<p className={styles.emptyTitle}>
								Aucun jeu ne correspond aux filtres.
							</p>
							<Button
								icon={FunnelX}
								onClick={clearFilters}
							>
								Effacer les filtres
							</Button>
						</>
					) : (
						<>
							<p className={styles.emptyTitle}>Le backlog est vide</p>
							<p className={styles.emptyText}>
								Ajoute un jeu depuis la recherche, avec une plateforme.
							</p>
							<Button
								icon={Search}
								variant="primary"
								onClick={onFocusSearch}
							>
								Rechercher un jeu
							</Button>
						</>
					)}
				</div>
			)}
			{hasNextPage && (
				<div
					ref={loadMoreRef}
					className={styles.loadMore}
				>
					<Spinner />
					Chargement…
				</div>
			)}
		</div>
	);
}
