/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont utils.ts pour toutes les fonctions */
import {
	type AppState,
	columnDefinitions,
	type ColumnFilter,
	type ColumnKey,
	type Database,
	type Game,
	type SortCriterion,
} from "./types";

/** Contenu complet de initialState.ts pour cet état, à coller tel quel (bouton d'export du footer de debug) */
export function buildInitialStateFile(state: AppState): string {
	return [
		"/* eslint-disable prettier/prettier -- généré par le bouton « Exporter l'état » du footer de debug, à coller tel quel */",
		'import type { AppState } from "./types";',
		"",
		`export const initialState = ${JSON.stringify(state, null, "\t")} satisfies AppState;`,
		"",
	].join("\n");
}

/** La base garde l'ordre d'ajout : le dernier jeu du tableau est le dernier ajouté */
export function getLastAddedGame(database: Database): Game | null {
	return database.games.at(-1) ?? null;
}

/** Un jeu est dans le backlog s'il a au moins une variante */
export function countBacklogGames(database: Database): number {
	const gameIds = new Set<number>();
	for (const variant of database.variants) {
		const version = database.versions.find(
			({ id }) => id === variant.versionId,
		);
		if (version) {
			gameIds.add(version.gameId);
		}
	}
	return gameIds.size;
}

export function getColumnLabel(key: ColumnKey): string {
	return columnDefinitions.find((column) => column.key === key)?.label ?? key;
}

export function describeSort(sort: SortCriterion[]): string {
	return (
		sort
			.map(
				({ column, direction }) =>
					`${getColumnLabel(column)} ${direction === "asc" ? "⬆️" : "⬇️"}`,
			)
			.join(", ") || "aucun"
	);
}

export function describeFilters(filters: ColumnFilter[]): string {
	return (
		filters
			.map(({ column, value }) => `${getColumnLabel(column)} = « ${value} »`)
			.join(", ") || "aucun"
	);
}
