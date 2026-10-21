/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont utils.ts pour toutes les fonctions */
import {
	type AppState,
	columnDefinitions,
	type ColumnFilter,
	type ColumnKey,
	type Database,
	type Game,
	type IgdbGameType,
	type IgdbImageId,
	type IgdbImageSize,
	type IgdbSearchGame,
	type SortCriterion,
} from "./types";

/** Texte sans espaces autour, `null` s'il est absent ou vide (IGDB laisse parfois des espaces en trop) */
export function trimToNull(text: string | undefined): string | null {
	const trimmed = text?.trim();
	return trimmed === undefined || trimmed === "" ? null : trimmed;
}

// ---------- IGDB ----------

/** Délai de la saisie de recherche : rester sous les 4 requêtes par seconde d'IGDB */
export const searchDelayMs = 300;

/** Types de fiche gardés par la recherche (section 8) ; leurs id se lisent via `game_types` */
const searchableGameTypes: string[] = [
	"Main Game",
	"Standalone Expansion",
	"Remake",
	"Remaster",
	"Expanded Game",
	"Port",
];

/** Appel IGDB via le proxy du serveur de dev, qui ajoute le Client-ID et le token */
export async function requestIgdb<T>(
	endpoint: string,
	body: string,
	signal: AbortSignal | null = null,
): Promise<T> {
	const response = await fetch(`/igdb/${endpoint}`, {
		method: "POST",
		body,
		signal,
	});
	if (response.status === 401) {
		throw new Error(
			"IGDB refuse l’accès (401) : le token a probablement expiré.",
		);
	}
	if (!response.ok) {
		throw new Error(`IGDB a répondu ${response.status} sur « ${endpoint} ».`);
	}
	return (await response.json()) as T;
}

// Lus une seule fois, puis gardés pour les recherches suivantes
let searchableGameTypeIds: Promise<number[]> | null = null;

function getSearchableGameTypeIds(): Promise<number[]> {
	searchableGameTypeIds ??= requestIgdb<IgdbGameType[]>(
		"game_types",
		"fields type; limit 50;",
	)
		.then((gameTypes) =>
			gameTypes
				.filter(({ type }) => searchableGameTypes.includes(type))
				.map(({ id }) => id),
		)
		.catch((error: unknown) => {
			// Nouvel essai à la prochaine recherche
			searchableGameTypeIds = null;
			throw error;
		});
	return searchableGameTypeIds;
}

/** Recherche IGDB. `search` ne se combine pas avec `sort` : les résultats restent dans l'ordre de pertinence d'IGDB */
export async function searchIgdbGames(
	query: string,
	signal: AbortSignal,
): Promise<IgdbSearchGame[]> {
	const gameTypeIds = await getSearchableGameTypeIds();
	const escapedQuery = query.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
	return requestIgdb<IgdbSearchGame[]>(
		"games",
		[
			`search "${escapedQuery}";`,
			"fields name, first_release_date, cover.image_id, game_localizations.name, game_localizations.region.identifier, alternative_names.name, alternative_names.comment;",
			`where game_type = (${gameTypeIds.join(",")});`,
			"limit 20;",
		].join(" "),
		signal,
	);
}

/** Seule fonction qui construit l'URL d'une image IGDB ; `t_thumb` (90 × 90) pour une miniature */
export function getIgdbImageUrl(
	imageId: IgdbImageId,
	size: IgdbImageSize,
	isHighDensity = false,
): string {
	return `https://images.igdb.com/igdb/image/upload/t_${size}${isHighDensity ? "_2x" : ""}/${imageId}.jpg`;
}

// ---------- Footer de debug ----------

/** Contenu complet de initialState.ts pour cet état, à coller tel quel (bouton d'export du footer de debug) */
export function buildInitialStateFile(state: AppState): string {
	return [
		"/* eslint-disable prettier/prettier -- généré par le bouton « Copier l’état » du footer de debug, à coller tel quel */",
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
