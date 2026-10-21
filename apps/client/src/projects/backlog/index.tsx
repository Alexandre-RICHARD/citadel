import { useState } from "react";

import styles from "./backlog.module.scss";
import { initialState } from "./initialState";
import type { AppState, Database } from "./types";
import {
	buildInitialStateFile,
	countBacklogGames,
	describeFilters,
	describeSort,
	getLastAddedGame,
} from "./utils";

function DebugFooter({
	state,
	undoHistoryLength,
}: {
	state: AppState;
	undoHistoryLength: number;
}) {
	const { database } = state;
	const lastAddedGame = getLastAddedGame(database);

	function exportState() {
		// eslint-disable-next-line no-console
		console.log(buildInitialStateFile(state));
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
				onClick={exportState}
			>
				📋 Exporter l’état
			</button>
		</footer>
	);
}

export function Backlog() {
	// Un useState par clé de initialState ; chaque setter arrive avec la phase qui s'en sert
	const [database, setDatabase] = useState<AppState["database"]>(
		initialState.database,
	);
	const [searchQuery] = useState<AppState["searchQuery"]>(
		initialState.searchQuery,
	);
	const [searchResults] = useState<AppState["searchResults"]>(
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

	// Historique d'annulation : en mémoire seulement, hors de l'état exporté (rempli en phase 7)
	const [undoHistory] = useState<Database[]>([]);

	// Seule fonction qui modifie la base : l'annuler / rétablir (phase 7) s'y branchera.
	// Les directives qui l'entourent disparaissent à son premier appel (phase 4).
	/* eslint-disable @typescript-eslint/no-unused-vars -- pas encore appelée */
	// @ts-expect-error -- pas encore appelée
	function changeDatabase(change: (current: Database) => Database) {
		setDatabase(change(database));
	}
	/* eslint-enable @typescript-eslint/no-unused-vars */

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
			<DebugFooter
				state={state}
				undoHistoryLength={undoHistory.length}
			/>
		</div>
	);
}
