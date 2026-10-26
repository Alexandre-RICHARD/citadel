import {
	FunnelX,
	Gamepad2,
	ListFilter,
	PencilLine,
	Search,
	SearchX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Spinner } from "../../../../components/Spinner";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { getColumnClassNames } from "../../getColumnClassNames";
import type { TableControls } from "../../tableControls.type";
import type { TableSettings } from "../../tableSettings.type";
import { ColumnFilterCell } from "../ColumnFilterCell";
import { ColumnHeader } from "../ColumnHeader";
import { GameRowGroup } from "../GameRowGroup";

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

// Le tableau du backlog (cahier des charges, §7 et §9) : en-têtes triables, ligne des filtres, lignes par pages de 25
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
		onClearFilters,
		onFocusSearch,
	} = settings;
	const { filters } = view;
	const visibleColumns = columns
		.filter(({ isVisible }) => isVisible)
		.map(({ key }) => key);
	const headerClassNames = getColumnClassNames(visibleColumns, true);
	const cellClassNames = getColumnClassNames(visibleColumns, false);
	const loadMoreRef = useRef<HTMLDivElement>(null);
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

	// Défilement infini : la page suivante se charge à l'approche du bas de page, avant de l'atteindre
	useEffect(() => {
		const loadMore = loadMoreRef.current;
		if (!hasNextPage || loadMore === null) return undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some(({ isIntersecting }) => isIntersecting))
					onLoadNextPage();
			},
			{ rootMargin: "0px 0px 800px 0px" },
		);
		observer.observe(loadMore);
		return () => observer.disconnect();
	}, [hasNextPage, rows.length, onLoadNextPage]);

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
							{userVersionCount > 1 ? "versions jouées" : "version jouée"}
						</>
					)}
				</span>
				{filters.length > 0 && (
					<span className={styles.captionFilters}>
						<ListFilter aria-hidden />
						{filters.length > 1
							? `${filters.length} filtres actifs`
							: "1 filtre actif"}
					</span>
				)}
				{isStale && (
					<span className={styles.captionFilters}>
						<Spinner />
						Mise à jour…
					</span>
				)}
				{table.isEditMode && (
					<span className={styles.editModeTag}>
						<PencilLine aria-hidden />
						Mode édition
						<span className={styles.editModeHint}>
							retour en lecture seule après 1 min sans activité
						</span>
					</span>
				)}
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
						/>
						{visibleColumns.map((column) => (
							<ColumnHeader
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
						{/* Un filtre actif fait place au bouton qui les retire tous (cahier des charges, §9) */}
						<th
							className={styles.expandCell}
							aria-label="Filtres"
						>
							{filters.length === 0 ? (
								<ListFilter
									className={styles.filterRowIcon}
									aria-hidden
								/>
							) : (
								<Button
									icon={FunnelX}
									variant="ghost"
									size="sm"
									ariaLabel="Effacer tous les filtres"
									tooltip="Effacer tous les filtres"
									tooltipPlacement="right"
									className={styles.clearFiltersButton}
									onClick={clearFilters}
								/>
							)}
						</th>
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
