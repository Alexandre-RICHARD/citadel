/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont utils.ts pour toutes les fonctions */
import {
	type AppState,
	columnDefinitions,
	type ColumnFilter,
	type ColumnKey,
	type Database,
	type EndingType,
	endingTypeDefinitions,
	type Game,
	type GameChoices,
	type GameImport,
	type IgdbDlcGame,
	type IgdbGameData,
	type IgdbGameNode,
	type IgdbGameStatus,
	type IgdbGameType,
	type IgdbImageId,
	type IgdbImageSize,
	type IgdbOriginalGame,
	type IgdbReference,
	type IgdbSearchGame,
	type IgdbVersionGame,
	type IsoDate,
	type Modal,
	type Platform,
	type SortCriterion,
	type Variant,
	type VariantChoice,
	type VariantStatus,
	variantStatusDefinitions,
	type Version,
	type VersionPlatform,
} from "./types";

// ---------- Textes et dates ----------

/** Texte sans espaces autour, `null` s'il est absent ou vide (IGDB laisse parfois des espaces en trop) */
export function trimToNull(text: string | undefined): string | null {
	const trimmed = text?.trim();
	return trimmed === undefined || trimmed === "" ? null : trimmed;
}

/** Timestamp Unix d'IGDB (en secondes) → date ISO */
export function toIsoDate(seconds: number | undefined): IsoDate | null {
	return seconds === undefined
		? null
		: (new Date(seconds * 1000).toISOString().slice(0, 10) as IsoDate);
}

/** « 2013-09-17 » → « 17/09/2013 » */
export function formatIsoDate(date: IsoDate): string {
	const [year, month, day] = date.split("-");
	return `${day}/${month}/${year}`;
}

/** Date de sortie du jeu (section 7) : « annulé », « à venir » sans date ou si elle est future, sinon la date */
export function formatReleaseDate(
	date: IsoDate | null,
	isCancelled: boolean,
): string {
	if (isCancelled) {
		return "annulé";
	}
	if (date === null || date > new Date().toISOString().slice(0, 10)) {
		return "à venir";
	}
	return formatIsoDate(date);
}

// ---------- IGDB : appels ----------

/** Délai de la saisie de recherche : rester sous les 4 requêtes par seconde d'IGDB */
export const searchDelayMs = 300;

/** Écart minimal entre deux requêtes : les requêtes de détail partent à la suite, jamais plus de 4 par seconde */
const igdbRequestGapMs = 260;
let nextIgdbRequestAt = 0;

async function waitForIgdbSlot(): Promise<void> {
	const now = Date.now();
	const startAt = Math.max(now, nextIgdbRequestAt);
	nextIgdbRequestAt = startAt + igdbRequestGapMs;
	if (startAt > now) {
		await new Promise((resolve) => setTimeout(resolve, startAt - now));
	}
}

/** Appel IGDB via le proxy du serveur de dev, qui ajoute le Client-ID et le token */
export async function requestIgdb<T>(
	endpoint: string,
	body: string,
	signal: AbortSignal | null = null,
): Promise<T> {
	await waitForIgdbSlot();
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

// Lue une seule fois, puis gardée pour les appels suivants
let igdbReference: Promise<IgdbReference> | null = null;

function getIgdbReference(): Promise<IgdbReference> {
	igdbReference ??= Promise.all([
		requestIgdb<IgdbGameType[]>("game_types", "fields type; limit 50;"),
		requestIgdb<IgdbGameStatus[]>("game_statuses", "fields status; limit 50;"),
	])
		.then(([gameTypes, gameStatuses]) => ({
			gameTypes: new Map(gameTypes.map(({ id, type }) => [id, type])),
			gameStatuses: new Map(gameStatuses.map(({ id, status }) => [id, status])),
		}))
		.catch((error: unknown) => {
			// Nouvel essai au prochain appel
			igdbReference = null;
			throw error;
		});
	return igdbReference;
}

function getGameTypeName(
	reference: IgdbReference,
	gameType: number | undefined,
): string {
	return (
		(gameType === undefined ? undefined : reference.gameTypes.get(gameType)) ??
		"type inconnu"
	);
}

// ---------- IGDB : recherche ----------

/** Types de fiche gardés par la recherche (section 8) */
const searchableGameTypes: string[] = [
	"Main Game",
	"Standalone Expansion",
	"Remake",
	"Remaster",
	"Expanded Game",
	"Port",
];

/** Recherche IGDB. `search` ne se combine pas avec `sort` : les résultats restent dans l'ordre de pertinence d'IGDB */
export async function searchIgdbGames(
	query: string,
	signal: AbortSignal,
): Promise<IgdbSearchGame[]> {
	const reference = await getIgdbReference();
	const gameTypeIds = [...reference.gameTypes]
		.filter(([, type]) => searchableGameTypes.includes(type))
		.map(([id]) => id);
	const escapedQuery = query.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
	return requestIgdb<IgdbSearchGame[]>(
		"games",
		[
			`search "${escapedQuery}";`,
			"fields name, first_release_date, cover.image_id, alternative_names.name, alternative_names.comment, platforms.name, platforms.abbreviation;",
			`where game_type = (${gameTypeIds.join(",")});`,
			"limit 20;",
		].join(" "),
		signal,
	);
}

// ---------- IGDB : un jeu complet (modale d'ajout) ----------

/** Types d'une version, originale comprise (section 5) : jeu principal ou édition, remaster, portage, version enrichie */
const versionGameTypes: string[] = [
	"Main Game",
	"Remaster",
	"Port",
	"Expanded Game",
];

/** Types rattachés à leur original par `parent_game` : un remake ou une extension standalone reste un jeu à part */
const parentGameVersionTypes: string[] = ["Remaster", "Port", "Expanded Game"];

/** Seuls les DLC et les extensions comptent, ni packs ni mises à jour (section 5) */
const dlcGameTypes: string[] = ["DLC", "Expansion"];

const gameNodeFields =
	"fields name, game_type, version_parent, parent_game, remasters, ports, expanded_games;";

/**
 * Tout ce qu'il faut stocker pour la fiche choisie (sections 3 et 5) : on remonte à son original,
 * on parcourt l'arbre de ses versions à toute profondeur, puis on lit leur détail et leurs DLC.
 * Les requêtes partent à la suite, chacune dépendant de la précédente.
 */
export async function fetchIgdbGameData(
	igdbId: number,
	signal: AbortSignal,
): Promise<IgdbGameData> {
	const reference = await getIgdbReference();

	function fetchNodes(where: string): Promise<IgdbGameNode[]> {
		return requestIgdb<IgdbGameNode[]>(
			"games",
			`${gameNodeFields} where ${where}; limit 500;`,
			signal,
		);
	}

	/** Parent qui mène à l'original : `version_parent` d'une édition, `parent_game` d'un remaster, portage ou version enrichie */
	function getOriginalParentId(node: IgdbGameNode): number | undefined {
		return (
			node.version_parent ??
			(parentGameVersionTypes.includes(
				getGameTypeName(reference, node.game_type),
			)
				? node.parent_game
				: undefined)
		);
	}

	// 1. Remonter de la fiche choisie jusqu'à l'original
	let original = (await fetchNodes(`id = ${igdbId}`)).at(0);
	if (original === undefined) {
		throw new Error(`Fiche IGDB ${igdbId} introuvable.`);
	}
	const visitedIds = new Set([original.id]);
	let parentId = getOriginalParentId(original);
	while (parentId !== undefined && !visitedIds.has(parentId)) {
		// eslint-disable-next-line no-await-in-loop -- chaque parent se lit sur la fiche précédente
		const parent = (await fetchNodes(`id = ${parentId}`)).at(0);
		if (parent === undefined) {
			break;
		}
		visitedIds.add(parent.id);
		original = parent;
		parentId = getOriginalParentId(parent);
	}

	// 2. Descendre l'arbre : éditions (`version_parent`), remasters, portages et versions enrichies
	const versionNodes = new Map<number, IgdbGameNode>([[original.id, original]]);
	const skippedEntries: IgdbGameData["skippedEntries"] = [];
	const skippedIds = new Set<number>();
	let level: IgdbGameNode[] = [original];
	while (level.length > 0) {
		const parentIds = level.map(({ id }) => id);
		const childIds = level.flatMap((node) => [
			...(node.remasters ?? []),
			...(node.ports ?? []),
			...(node.expanded_games ?? []),
		]);
		const conditions = [`version_parent = (${parentIds.join(",")})`];
		if (childIds.length > 0) {
			conditions.push(`id = (${childIds.join(",")})`);
		}
		// eslint-disable-next-line no-await-in-loop -- chaque niveau de l'arbre se lit sur le précédent
		const candidates = await fetchNodes(conditions.join(" | "));
		level = [];
		for (const candidate of candidates) {
			const typeName = getGameTypeName(reference, candidate.game_type);
			const isNew =
				!versionNodes.has(candidate.id) && !skippedIds.has(candidate.id);
			// Un bundle rattaché par `version_parent` est une édition vendue avec ses DLC : une version (section 5)
			const isVersion =
				versionGameTypes.includes(typeName) ||
				(typeName === "Bundle" && candidate.version_parent !== undefined);
			if (isNew && isVersion) {
				versionNodes.set(candidate.id, candidate);
				level.push(candidate);
			} else if (isNew) {
				skippedIds.add(candidate.id);
				skippedEntries.push({
					reason: `« ${candidate.name} » est rattaché comme version, mais son type est « ${typeName} » : fiche ignorée.`,
					entry: candidate,
				});
			}
		}
	}

	// 3. Détail des versions, puis données propres au jeu sur sa fiche originale
	const versions = await requestIgdb<IgdbVersionGame[]>(
		"games",
		`fields name, version_title, cover.image_id, url, platforms.name, platforms.abbreviation, platforms.slug, release_dates.date, release_dates.platform, dlcs, expansions; where id = (${[...versionNodes.keys()].join(",")}); limit 500;`,
		signal,
	);
	const originalGame = (
		await requestIgdb<IgdbOriginalGame[]>(
			"games",
			`fields name, alternative_names.name, alternative_names.comment, first_release_date, game_status, artworks.image_id, collections.name, franchise.name, franchises.name, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, involved_companies.company.logo.image_id; where id = ${original.id};`,
			signal,
		)
	).at(0);
	if (originalGame === undefined) {
		throw new Error(`Fiche IGDB originale ${original.id} introuvable.`);
	}

	// 4. DLC et extensions de l'original et de toutes ses versions, sans doublon
	const dlcIds = [
		...new Set(
			versions.flatMap((version) => [
				...(version.dlcs ?? []),
				...(version.expansions ?? []),
			]),
		),
	];
	const dlcCandidates =
		dlcIds.length === 0
			? []
			: await requestIgdb<IgdbDlcGame[]>(
					"games",
					`fields name, game_type; where id = (${dlcIds.join(",")}); limit 500;`,
					signal,
				);

	return {
		original: originalGame,
		versions,
		dlcs: dlcCandidates
			.filter((dlc) =>
				dlcGameTypes.includes(getGameTypeName(reference, dlc.game_type)),
			)
			.toSorted((first, second) => first.id - second.id),
		gameStatus:
			originalGame.game_status === undefined
				? null
				: (reference.gameStatuses.get(originalGame.game_status) ?? null),
		skippedEntries,
	};
}

/** Seule fonction qui construit l'URL d'une image IGDB ; `t_thumb` (90 × 90) pour une miniature */
export function getIgdbImageUrl(
	imageId: IgdbImageId,
	size: IgdbImageSize,
	isHighDensity = false,
): string {
	return `https://images.igdb.com/igdb/image/upload/t_${size}${isHighDensity ? "_2x" : ""}/${imageId}.jpg`;
}

// ---------- Modales : versions et plateformes ----------

/** Range les données IGDB dans la modale d'ajout si elle attend toujours cette fiche : cover pré-sélectionnée, version pré-sélectionnée gardée si elle existe */
export function receiveGameImport(
	modal: Modal | null,
	igdbId: number,
	gameImport: GameImport,
): Modal | null {
	if (
		modal?.kind !== "addGame" ||
		modal.igdbId !== igdbId ||
		modal.gameImport !== null
	) {
		return modal;
	}
	const { versionId } = modal.variantChoice;
	return {
		...modal,
		gameImport,
		choices: {
			...modal.choices,
			imageId: modal.choices.imageId ?? gameImport.imageIds.at(0) ?? null,
		},
		variantChoice: {
			...modal.variantChoice,
			versionId: gameImport.versions.some(({ id }) => id === versionId)
				? versionId
				: null,
		},
	};
}

/** Plateformes proposées pour une variante (section 5) : celles de la version, puis les émulateurs de ces consoles */
export function getPlatformOptions(
	versionId: number,
	versionPlatforms: VersionPlatform[],
	platforms: Platform[],
): Platform[] {
	const consoleIds = versionPlatforms
		.filter((versionPlatform) => versionPlatform.versionId === versionId)
		.map(({ platformId }) => platformId);
	const consoles = consoleIds.flatMap(
		(consoleId) => platforms.find(({ id }) => id === consoleId) ?? [],
	);
	const emulators = platforms.filter(
		({ emulatedPlatformId }) =>
			emulatedPlatformId !== null && consoleIds.includes(emulatedPlatformId),
	);
	return [...consoles, ...emulators];
}

/** Libellé d'une version : son titre (le nom du jeu pour l'originale), puis ses plateformes */
export function getVersionLabel(
	version: Version,
	gameName: string,
	versionPlatforms: VersionPlatform[],
	platforms: Platform[],
): string {
	const platformNames = versionPlatforms
		.filter((versionPlatform) => versionPlatform.versionId === version.id)
		.flatMap(
			({ platformId }) =>
				platforms.find(({ id }) => id === platformId)?.name ?? [],
		);
	const title = version.title ?? `${gameName} (originale)`;
	return platformNames.length === 0
		? title
		: `${title} · ${platformNames.join(", ")}`;
}

/** Plateformes d'une version avec leur date de sortie, ex. « PS3 11/11/2011 · PC 11/11/2011 » */
export function describeVersionPlatforms(
	versionId: number,
	versionPlatforms: VersionPlatform[],
	platforms: Platform[],
): string {
	return versionPlatforms
		.filter((versionPlatform) => versionPlatform.versionId === versionId)
		.map(({ platformId, releaseDate }) => {
			const name =
				platforms.find(({ id }) => id === platformId)?.name ?? `#${platformId}`;
			return `${name} ${releaseDate === null ? "(date inconnue)" : formatIsoDate(releaseDate)}`;
		})
		.join(" · ");
}

// ---------- Écritures en base, toutes passées à changeDatabase ----------

/** Ajoute à `existing` les éléments d'`incoming` dont l'id manque : aucun doublon */
export function mergeById<T extends { id: number }>(
	existing: T[],
	incoming: T[],
): T[] {
	const ids = new Set(existing.map(({ id }) => id));
	const merged = [...existing];
	for (const item of incoming) {
		if (!ids.has(item.id)) {
			ids.add(item.id);
			merged.push(item);
		}
	}
	return merged;
}

function createVariant(
	database: Database,
	versionId: number,
	platformId: number,
): Variant {
	return {
		id: Math.max(0, ...database.variants.map(({ id }) => id)) + 1,
		versionId,
		platformId,
		status: "notStarted",
		owned: false,
		playSoon: false,
		finishDate: null,
		sureFinishCount: 0,
		probableFinishCount: 0,
		trackedPlayTimeMinutes: 0,
		estimatedPlayTimeMinutes: 0,
		rating: null,
		comment: null,
	};
}

/** Ajoute une variante, sauf si la même version + plateforme existe déjà (section 5) */
export function addVariant(
	database: Database,
	versionId: number,
	platformId: number,
): Database {
	if (
		database.variants.some(
			(variant) =>
				variant.versionId === versionId && variant.platformId === platformId,
		)
	) {
		return database;
	}
	return {
		...database,
		variants: [
			...database.variants,
			createVariant(database, versionId, platformId),
		],
	};
}

/**
 * « Valider » de la modale d'ajout (section 8) : le jeu, toutes ses versions, ses DLC, sa série,
 * sa franchise et ses sociétés, sans doublon ; puis la variante si version et plateforme sont choisies.
 * Un jeu déjà en base garde ses choix : seules les fiches manquantes s'ajoutent.
 */
export function addGameImport(
	database: Database,
	gameImport: GameImport,
	choices: GameChoices,
	variantChoice: VariantChoice,
): Database {
	const game: Game = {
		...gameImport.game,
		...choices,
		seriesNumber: gameImport.series === null ? null : choices.seriesNumber,
	};
	const knownVersionPlatforms = new Set(
		database.versionPlatforms.map(
			({ versionId, platformId }) => `${versionId}-${platformId}`,
		),
	);
	const withGame: Database = {
		...database,
		games: mergeById(database.games, [game]),
		versions: mergeById(database.versions, gameImport.versions),
		versionPlatforms: [
			...database.versionPlatforms,
			...gameImport.versionPlatforms.filter(
				({ versionId, platformId }) =>
					!knownVersionPlatforms.has(`${versionId}-${platformId}`),
			),
		],
		platforms: mergeById(database.platforms, gameImport.platforms),
		dlcs: mergeById(database.dlcs, gameImport.dlcs),
		series: mergeById(
			database.series,
			gameImport.series === null ? [] : [gameImport.series],
		),
		franchises: mergeById(
			database.franchises,
			gameImport.franchise === null ? [] : [gameImport.franchise],
		),
		companies: mergeById(
			database.companies,
			[gameImport.developer, gameImport.publisher].flatMap(
				(company) => company ?? [],
			),
		),
	};
	const { versionId, platformId } = variantChoice;
	return versionId === null || platformId === null
		? withGame
		: addVariant(withGame, versionId, platformId);
}

// ---------- Tableau : agrégats et affichage (sections 6, 7 et 9) ----------

/** Défilement infini : nombre de jeux par page */
export const backlogPageSize = 25;

export function findById<T extends { id: number }>(
	items: T[],
	id: number | null,
): T | null {
	return id === null ? null : (items.find((item) => item.id === id) ?? null);
}

export function getStatusLabel(status: VariantStatus): string {
	return (
		variantStatusDefinitions.find(({ key }) => key === status)?.label ?? status
	);
}

export function getEndingTypeLabel(endingType: EndingType): string {
	return (
		endingTypeDefinitions.find(({ key }) => key === endingType)?.label ??
		endingType
	);
}

function getStatusRank(status: VariantStatus): number | null {
	return (
		variantStatusDefinitions.find(({ key }) => key === status)?.rank ?? null
	);
}

/** Le statut de plus haut rang ; « Abandonné », hors échelle, n'est jamais retenu */
function getHighestStatus(statuses: VariantStatus[]): VariantStatus | null {
	let highest: VariantStatus | null = null;
	let highestRank = 0;
	for (const status of statuses) {
		const rank = getStatusRank(status);
		if (rank !== null && rank > highestRank) {
			highest = status;
			highestRank = rank;
		}
	}
	return highest;
}

/**
 * Statut de la ligne du jeu (section 6) : les « Pas commencé » sont ignorées tant qu'une autre variante
 * a un statut, puis la première situation qui correspond l'emporte. `null` : impossible de choisir.
 */
export function getGameStatus(statuses: VariantStatus[]): VariantStatus | null {
	const played = statuses.filter((status) => status !== "notStarted");
	// Toutes « Pas commencé »
	if (played.length === 0) {
		return "notStarted";
	}
	// Au moins une au rang 5 ou plus : le plus haut de ces statuts
	const finished = played.filter((status) => (getStatusRank(status) ?? 0) >= 5);
	if (finished.length > 0) {
		return getHighestStatus(finished);
	}
	// Toutes « Abandonné »
	if (played.every((status) => status === "abandoned")) {
		return "abandoned";
	}
	// Aucune « Abandonné » : le plus haut statut
	if (!played.includes("abandoned")) {
		return getHighestStatus(played);
	}
	// « Abandonné » mêlé à un statut en cours (rangs 2 à 4)
	return null;
}

export function sum(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

/** La plus ancienne date, `null` s'il n'y en a aucune */
export function getEarliestDate(dates: (IsoDate | null)[]): IsoDate | null {
	let earliest: IsoDate | null = null;
	for (const date of dates) {
		if (date !== null && (earliest === null || date < earliest)) {
			earliest = date;
		}
	}
	return earliest;
}

/** La plus haute valeur, `null` s'il n'y en a aucune */
export function getHighestValue(values: (number | null)[]): number | null {
	const knownValues = values.filter((value) => value !== null);
	return knownValues.length === 0 ? null : Math.max(...knownValues);
}

/** Minutes → « 12 h 30 » */
export function formatDuration(minutes: number): string {
	return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

/** « Fois fini » : le compteur sûr, puis le probable s'il y en a, ex. « 2 (+1 ?) » */
export function formatFinishCount(sure: number, probable: number): string {
	return probable === 0 ? String(sure) : `${sure} (+${probable} ?)`;
}

/** « faits / total » ; vide quand le jeu n'a pas de DLC */
export function formatDlcProgress(done: number, total: number): string {
	return total === 0 ? "" : `${done} / ${total}`;
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
