import { useEffect, useState } from "react";

import styles from "./backlog.module.scss";
import { initialState } from "./initialState";
import { mapSearchResult } from "./mappers";
import type { AppState, Database, IgdbImageId, SearchResult } from "./types";
import {
	buildInitialStateFile,
	countBacklogGames,
	describeFilters,
	describeSort,
	getIgdbImageUrl,
	getLastAddedGame,
	searchDelayMs,
	searchIgdbGames,
} from "./utils";

/** Miniature IGDB : `t_thumb`, et `t_thumb_2x` pour les écrans haute densité */
function Thumbnail({ imageId }: { imageId: IgdbImageId | null }) {
	if (imageId === null) {
		return <span className={styles.thumbnailPlaceholder}>🎮</span>;
	}
	return (
		<img
			className={styles.thumbnail}
			src={getIgdbImageUrl(imageId, "thumb")}
			srcSet={`${getIgdbImageUrl(imageId, "thumb", true)} 2x`}
			alt=""
			loading="lazy"
		/>
	);
}

function SearchBar({
	query,
	results,
	isSearching,
	error,
	database,
	onQueryChange,
}: {
	query: string;
	results: SearchResult[];
	isSearching: boolean;
	error: string | null;
	database: Database;
	onQueryChange: (query: string) => void;
}) {
	return (
		<div className={styles.search}>
			<input
				type="search"
				className={styles.searchInput}
				placeholder="🔍 Rechercher un jeu sur IGDB"
				aria-label="Rechercher un jeu sur IGDB"
				value={query}
				onChange={(event) => onQueryChange(event.target.value)}
			/>
			{query.trim() !== "" && (
				<ul className={styles.searchResults}>
					{isSearching && (
						<li className={styles.searchMessage}>⏳ Recherche…</li>
					)}
					{error !== null && (
						<li className={styles.searchMessage}>⚠️ {error}</li>
					)}
					{!isSearching && error === null && results.length === 0 && (
						<li className={styles.searchMessage}>Aucun résultat</li>
					)}
					{results.map((result) => (
						<li
							key={result.id}
							className={styles.searchResult}
						>
							<Thumbnail imageId={result.coverImageId} />
							<span className={styles.searchResultName}>
								<strong>{result.frenchName ?? result.name}</strong>
								{result.frenchName !== null && (
									<span className={styles.originalName}> {result.name}</span>
								)}
								{result.releaseYear !== null && ` (${result.releaseYear})`}
							</span>
							{database.versions.some(({ id }) => id === result.id) && (
								<span className={styles.inDatabaseBadge}>✅ déjà en base</span>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const copyLabels = {
	idle: "📋 Copier l’état",
	copied: "✅ État copié",
	failed: "❌ Copie impossible",
};

function DebugFooter({
	state,
	undoHistoryLength,
}: {
	state: AppState;
	undoHistoryLength: number;
}) {
	const { database } = state;
	const lastAddedGame = getLastAddedGame(database);
	const [copyStatus, setCopyStatus] = useState<keyof typeof copyLabels>("idle");

	function showCopyStatus(status: keyof typeof copyLabels) {
		setCopyStatus(status);
		window.setTimeout(() => setCopyStatus("idle"), 2000);
	}

	function copyState() {
		navigator.clipboard
			.writeText(buildInitialStateFile(state))
			.then(() => showCopyStatus("copied"))
			.catch((error: unknown) => {
				console.error("Copie de l’état impossible :", error);
				showCopyStatus("failed");
			});
	}

	return (
		<footer className={styles.debugFooter}>
			<span>🐞 Debug</span>
			<span>
				Dernier jeu ajouté :{" "}
				{lastAddedGame
					? (lastAddedGame.frenchName ?? lastAddedGame.name)
					: "aucun"}
			</span>
			<span>
				En base — jeux : {database.games.length} · versions :{" "}
				{database.versions.length} · DLC : {database.dlcs.length}
			</span>
			<span>
				Backlog — jeux : {countBacklogGames(database)} · variantes :{" "}
				{database.variants.length}
			</span>
			<span>Historique d’annulation : {undoHistoryLength}</span>
			<span>Tri : {describeSort(state.sort)}</span>
			<span>Filtres : {describeFilters(state.filters)}</span>
			<button
				type="button"
				onClick={copyState}
			>
				{copyLabels[copyStatus]}
			</button>
		</footer>
	);
}

export function Backlog() {
	// Un useState par clé de initialState ; chaque setter arrive avec la phase qui s'en sert
	const [database, setDatabase] = useState<AppState["database"]>(
		initialState.database,
	);
	const [searchQuery, setSearchQuery] = useState<AppState["searchQuery"]>(
		initialState.searchQuery,
	);
	const [searchResults, setSearchResults] = useState<AppState["searchResults"]>(
		initialState.searchResults,
	);
	const [modal] = useState<AppState["modal"]>(initialState.modal);
	const [popover] = useState<AppState["popover"]>(initialState.popover);
	const [isEditMode] = useState<AppState["isEditMode"]>(
		initialState.isEditMode,
	);
	const [expandedGameIds] = useState<AppState["expandedGameIds"]>(
		initialState.expandedGameIds,
	);
	const [columns] = useState<AppState["columns"]>(initialState.columns);
	const [sort] = useState<AppState["sort"]>(initialState.sort);
	const [filters] = useState<AppState["filters"]>(initialState.filters);
	const [loadedPageCount] = useState<AppState["loadedPageCount"]>(
		initialState.loadedPageCount,
	);

	// États passagers, hors AppState : historique d'annulation (rempli en phase 7), recherche en cours
	const [undoHistory] = useState<Database[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);

	// Seule fonction qui modifie la base : l'annuler / rétablir (phase 7) s'y branchera.
	// Les directives qui l'entourent disparaissent à son premier appel (phase 4).
	/* eslint-disable @typescript-eslint/no-unused-vars -- pas encore appelée */
	// @ts-expect-error -- pas encore appelée
	function changeDatabase(change: (current: Database) => Database) {
		setDatabase(change(database));
	}
	/* eslint-enable @typescript-eslint/no-unused-vars */

	function changeSearchQuery(query: string) {
		setSearchQuery(query);
		if (query.trim() === "") {
			setSearchResults([]);
			setIsSearching(false);
			setSearchError(null);
		}
	}

	// Recherche temporisée : une requête 300 ms après la dernière frappe, la précédente est annulée
	useEffect(() => {
		const query = searchQuery.trim();
		if (query === "") {
			return undefined;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			setIsSearching(true);
			setSearchError(null);
			searchIgdbGames(query, controller.signal)
				.then((games) => setSearchResults(games.map(mapSearchResult)))
				.catch((error: unknown) => {
					if (!controller.signal.aborted) {
						setSearchError(
							error instanceof Error ? error.message : String(error),
						);
					}
				})
				.finally(() => {
					if (!controller.signal.aborted) {
						setIsSearching(false);
					}
				});
		}, searchDelayMs);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [searchQuery]);

	// Même ordre de clés que AppState et initialState : l'export reste comparable au fichier collé
	const state: AppState = {
		database,
		searchQuery,
		searchResults,
		modal,
		popover,
		isEditMode,
		expandedGameIds,
		columns,
		sort,
		filters,
		loadedPageCount,
	};

	return (
		<div className={styles.page}>
			<header className={styles.toolbar}>
				<SearchBar
					query={searchQuery}
					results={searchResults}
					isSearching={isSearching}
					error={searchError}
					database={database}
					onQueryChange={changeSearchQuery}
				/>
			</header>
			<DebugFooter
				state={state}
				undoHistoryLength={undoHistory.length}
			/>
		</div>
	);
}
