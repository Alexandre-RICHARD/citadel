import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";
import { Clapperboard, FileUp, FunnelX, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";

import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { ClearFiltersCell } from "../../../../components/ClearFiltersCell";
import { Spinner } from "../../../../components/Spinner";
import { TableCaptionStatus } from "../../../../components/TableCaptionStatus";
import { useLoadMoreOnScroll } from "../../../../hooks/useLoadMoreOnScroll";
import mediaStyles from "../../../../media.module.scss";
import { ScrollTopButton } from "../../../Homepage/components/ScrollTopButton";
import { getMediaColumnClassNames } from "../../getMediaColumnClassNames";
import type { MediaTableControls } from "../../mediaTableControls.type";
import type { MediaTableSettings } from "../../mediaTableSettings.type";
import { MediaColumnFilterCell } from "../MediaColumnFilterCell";
import { MediaColumnHeader } from "../MediaColumnHeader";
import { MediaRowGroup } from "../MediaRowGroup";

type Props = {
	rows: MediaRowFm[];
	// Médias qui correspondent aux filtres, toutes pages confondues
	matchedCount: number;
	movieCount: number;
	showCount: number;
	originalLanguages: string[];
	hasNextPage: boolean;
	onLoadNextPage: () => void;
	// La vue vient de changer : les lignes affichées restent celles de la précédente, le temps de lire la nouvelle
	isStale: boolean;
	settings: MediaTableSettings;
	table: MediaTableControls;
};

// Le tableau des films et séries : celui des jeux (en-têtes triables, ligne des filtres, lignes par pages), avec ses colonnes
export function MediaTable({
	rows,
	matchedCount,
	movieCount,
	showCount,
	originalLanguages,
	hasNextPage,
	onLoadNextPage,
	isStale,
	settings,
	table,
}: Props) {
	const {
		columns,
		view,
		expandedShowId,
		expandedSeasonId,
		onToggleSort,
		onFilterChange,
		onFilterModeChange,
		onClearFilters,
		onFocusSearch,
		onImportList,
	} = settings;
	const { filters } = view;
	// Mêmes objets tant que les colonnes ne changent pas : les lignes mémorisées les comparent par identité
	const visibleColumns = useMemo(
		() => columns.filter(({ isVisible }) => isVisible).map(({ key }) => key),
		[columns],
	);
	const headerClassNames = useMemo(
		() => getMediaColumnClassNames(visibleColumns, true),
		[visibleColumns],
	);
	const cellClassNames = useMemo(
		() => getMediaColumnClassNames(visibleColumns, false),
		[visibleColumns],
	);
	const loadMoreRef = useLoadMoreOnScroll(
		hasNextPage,
		rows.length,
		onLoadNextPage,
	);
	// Les bornes des nombres et des dates sont des champs libres : effacer les filtres recrée la ligne pour les vider
	const [filterRowKey, setFilterRowKey] = useState(0);
	const totalCount = movieCount + showCount;

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
							{matchedCount > 1 ? "médias" : "média"} sur {totalCount}
						</>
					) : (
						<>
							<strong>{movieCount}</strong> {movieCount > 1 ? "films" : "film"}
							<span className={styles.captionSeparator}>·</span>
							<strong>{showCount}</strong> {showCount > 1 ? "séries" : "série"}
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
				aria-label="Films et séries"
				aria-busy={isStale}
				data-backlog-table
			>
				<thead>
					<tr className={styles.headerRow}>
						<th
							className={styles.expandCell}
							aria-label="Saisons"
						>
							<ScrollTopButton />
						</th>
						{visibleColumns.map((column) => (
							<MediaColumnHeader
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
						{visibleColumns.map((column: ConnectedMediaColumn) => (
							<th
								key={column}
								className={cellClassNames[column]}
							>
								<MediaColumnFilterCell
									column={column}
									filter={
										filters.find((filter) => filter.column === column) ?? null
									}
									originalLanguages={originalLanguages}
									onChange={(filter) => onFilterChange(column, filter)}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody className={joinClassNames(isStale && styles.staleRows)}>
					{rows.map((row) => {
						const isExpanded = row.userMediaId === expandedShowId;
						return (
							<MediaRowGroup
								key={row.userMediaId}
								row={row}
								columns={visibleColumns}
								cellClassNames={cellClassNames}
								isExpanded={isExpanded}
								expandedSeasonId={isExpanded ? expandedSeasonId : null}
								table={table}
							/>
						);
					})}
				</tbody>
			</table>
			{rows.length === 0 && (
				<div className={styles.emptyState}>
					<span className={styles.emptyIcon}>
						{filters.length > 0 ? (
							<SearchX aria-hidden />
						) : (
							<Clapperboard aria-hidden />
						)}
					</span>
					{filters.length > 0 ? (
						<>
							<p className={styles.emptyTitle}>
								Aucun film ni aucune série ne correspond aux filtres.
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
								Ajoutez un film ou une série depuis la recherche TMDB, ou
								importez votre liste.
							</p>
							<span className={mediaStyles.emptyActions}>
								<Button
									icon={Search}
									variant="primary"
									onClick={onFocusSearch}
								>
									Rechercher sur TMDB
								</Button>
								<Button
									icon={FileUp}
									onClick={onImportList}
								>
									Importer une liste
								</Button>
							</span>
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
