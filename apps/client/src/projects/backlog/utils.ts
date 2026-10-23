/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont utils.ts pour toutes les fonctions */
import {
	type AppState,
	columnDefinitions,
	type ColumnFilter,
	type ColumnKey,
	type ColumnSetting,
	type Database,
	type Dlc,
	type DoneDlc,
	type EndingType,
	endingTypeDefinitions,
	type Game,
	type GameImport,
	type GameRow,
	type IgdbDlcGame,
	type IgdbGameData,
	type IgdbGameImages,
	type IgdbGameNode,
	type IgdbGameStatus,
	type IgdbGameType,
	type IgdbImageId,
	type IgdbImageSize,
	type IgdbOriginalGame,
	type IgdbReference,
	type IgdbSearchGame,
	type IgdbSearchHit,
	type IgdbVersionGame,
	type ImportSelection,
	type IsoDate,
	type Modal,
	type Platform,
	type Series,
	type SeriesChoice,
	type SeriesDrop,
	type SeriesEntry,
	type SortCriterion,
	type Status,
	statusDefinitions,
	type UserGame,
	type UserGameDraft,
	type UserVersion,
	type UserVersionDraft,
	type UserVersionRow,
	type Version,
	type VersionPlatform,
} from "./types";

// ---------- Textes et dates ----------

/** Texte sans espaces autour, `null` s'il est absent ou vide (IGDB laisse parfois des espaces en trop) */
export function trimToNull(text: string | undefined): string | null {
	const trimmed = text?.trim();
	return trimmed === undefined || trimmed === "" ? null : trimmed;
}

/** Sans accents ni majuscules : « pokemon » trouve « Pokémon » */
function normalizeText(text: string): string {
	return text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();
}

/** Timestamp Unix d'IGDB (en secondes) → date ISO */
export function toIsoDate(seconds: number | undefined): IsoDate | null {
	return seconds === undefined
		? null
		: (new Date(seconds * 1000).toISOString().slice(0, 10) as IsoDate);
}

/** Date du jour, en heure locale */
export function getTodayIsoDate(): IsoDate {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}` as IsoDate;
}

/** Valeur d'un champ date (« 2026-10-21 ») → date ISO ; `null` si elle n'en est pas une */
export function parseIsoDate(text: string): IsoDate | null {
	return /^\d{4}-\d{2}-\d{2}$/.test(text) ? (text as IsoDate) : null;
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
	if (date === null || date > getTodayIsoDate()) {
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

/** Types rattachés à leur original par `parent_game` : un remake ou une extension standalone reste un jeu à part */
const parentGameVersionTypes: string[] = ["Remaster", "Port", "Expanded Game"];

/** Parent qui mène à l'original : `version_parent` d'une édition, `parent_game` d'un remaster, portage ou version enrichie */
function getOriginalParentId(
	reference: IgdbReference,
	node: Pick<IgdbGameNode, "game_type" | "version_parent" | "parent_game">,
): number | undefined {
	return (
		node.version_parent ??
		(parentGameVersionTypes.includes(getGameTypeName(reference, node.game_type))
			? node.parent_game
			: undefined)
	);
}

// ---------- IGDB : recherche ----------

/** Types jamais proposés par la recherche (section 8) */
const excludedSearchGameTypes: string[] = ["Mod", "Fork"];

/** Types qu'un résultat peut avoir : un jeu de base, ou une version dont l'original est introuvable */
const resultGameTypes: string[] = [
	"Main Game",
	"Standalone Expansion",
	"Remake",
	"Remaster",
	"Expanded Game",
	"Port",
];

/** Contenus additionnels rattachés à leur jeu par `parent_game` : la recherche mène à ce jeu */
const addOnGameTypes: string[] = [
	"DLC",
	"Expansion",
	"Pack / Addon",
	"Update",
	"Episode",
	"Season",
];

const searchGameFields =
	"fields name, game_type, version_parent, parent_game, bundles, first_release_date, cover.image_id, alternative_names.name, alternative_names.comment, platforms.name, platforms.abbreviation;";

/** Fiches lues à IGDB ; elles seront regroupées par jeu, d'où plus que les 20 résultats affichés */
const searchFetchLimit = 50;
const searchResultLimit = 20;

/** Fiche qui rapproche une fiche trouvée de son jeu : l'original d'une version, le jeu d'un contenu additionnel */
function getSearchParentId(
	reference: IgdbReference,
	game: IgdbSearchGame,
): number | undefined {
	return (
		getOriginalParentId(reference, game) ??
		(addOnGameTypes.includes(getGameTypeName(reference, game.game_type))
			? game.parent_game
			: undefined)
	);
}

/** Bundle qui n'est pas une édition rattachée par `version_parent` : la recherche mène aux jeux qu'il contient */
function isUnattachedBundle(
	reference: IgdbReference,
	game: IgdbSearchGame,
): boolean {
	return (
		getGameTypeName(reference, game.game_type) === "Bundle" &&
		game.version_parent === undefined
	);
}

/** Date de sortie pour ranger les jeux d'un bundle, les dates inconnues en dernier */
function getReleaseTime(game: IgdbSearchGame): number {
	return game.first_release_date ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Recherche IGDB. `search` ne se combine pas avec `sort` : les résultats restent dans l'ordre de pertinence d'IGDB.
 * Chaque fiche trouvée mène à son jeu de base, qui prend la place de la mieux classée (section 8).
 */
export async function searchIgdbGames(
	query: string,
	signal: AbortSignal,
): Promise<IgdbSearchHit[]> {
	const reference = await getIgdbReference();
	const gameTypeIds = [...reference.gameTypes]
		.filter(([, type]) => !excludedSearchGameTypes.includes(type))
		.map(([id]) => id);
	const escapedQuery = query.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
	const matches = await requestIgdb<IgdbSearchGame[]>(
		"games",
		[
			`search "${escapedQuery}";`,
			searchGameFields,
			`where game_type = (${gameTypeIds.join(",")});`,
			`limit ${searchFetchLimit};`,
		].join(" "),
		signal,
	);

	// Lire, niveau par niveau, les fiches absentes des résultats : les parents (un portage peut descendre
	// d'un autre portage, un DLC d'une édition) et le contenu des bundles
	const gamesById = new Map(matches.map((game) => [game.id, game]));
	const requestedIds = new Set<number>();
	const expandedBundleIds = new Set<number>();
	let level = matches;
	while (level.length > 0) {
		const parentIds = [
			...new Set(
				level.flatMap((game) => getSearchParentId(reference, game) ?? []),
			),
		].filter((id) => !gamesById.has(id) && !requestedIds.has(id));
		const bundleIds = level
			.filter(
				(game) =>
					isUnattachedBundle(reference, game) &&
					!expandedBundleIds.has(game.id),
			)
			.map(({ id }) => id);
		const conditions = [
			...(parentIds.length === 0 ? [] : [`id = (${parentIds.join(",")})`]),
			...(bundleIds.length === 0 ? [] : [`bundles = (${bundleIds.join(",")})`]),
		];
		if (conditions.length === 0) {
			break;
		}
		for (const id of parentIds) {
			requestedIds.add(id);
		}
		for (const id of bundleIds) {
			expandedBundleIds.add(id);
		}
		// eslint-disable-next-line no-await-in-loop -- chaque niveau se lit sur le précédent
		level = await requestIgdb<IgdbSearchGame[]>(
			"games",
			`${searchGameFields} where ${conditions.join(" | ")}; limit 500;`,
			signal,
		);
		for (const game of level) {
			gamesById.set(game.id, game);
		}
	}

	/** Jeux de base d'une fiche : elle-même, l'original d'une version, le jeu d'un contenu additionnel, ou les jeux d'un bundle */
	function findBaseGames(
		game: IgdbSearchGame,
		visitedIds: Set<number>,
	): IgdbSearchGame[] {
		if (visitedIds.has(game.id)) {
			return [];
		}
		visitedIds.add(game.id);
		if (isUnattachedBundle(reference, game)) {
			return [...gamesById.values()]
				.filter((content) => content.bundles?.includes(game.id) === true)
				.toSorted(
					(first, second) => getReleaseTime(first) - getReleaseTime(second),
				)
				.flatMap((content) => findBaseGames(content, visitedIds));
		}
		const parent = gamesById.get(getSearchParentId(reference, game) ?? NaN);
		if (parent !== undefined) {
			return findBaseGames(parent, visitedIds);
		}
		// Un DLC sans jeu, un bundle vide… ne mènent à rien
		return resultGameTypes.includes(getGameTypeName(reference, game.game_type))
			? [game]
			: [];
	}

	// Un jeu n'apparaît qu'une fois, à la place de sa fiche la mieux classée. Les jeux trouvés seulement via un bundle
	// passent après les autres : « Final Fantasy VII » ne doit pas proposer FF8 en deuxième, via un pack FF7 + FF8.
	// « via » nomme la fiche quand le jeu n'a pas été trouvé lui-même et qu'elle porte un autre nom (les portages de FF7 s'appellent comme lui)
	const matchedIds = new Set(matches.map(({ id }) => id));
	const hits = new Map<number, IgdbSearchHit>();
	for (const match of [
		...matches.filter((game) => !isUnattachedBundle(reference, game)),
		...matches.filter((game) => isUnattachedBundle(reference, game)),
	]) {
		for (const game of findBaseGames(match, new Set())) {
			if (!hits.has(game.id)) {
				hits.set(game.id, {
					game,
					matchedName:
						matchedIds.has(game.id) ||
						match.name.toLowerCase() === game.name.toLowerCase()
							? null
							: match.name,
				});
			}
		}
	}
	return [...hits.values()].slice(0, searchResultLimit);
}

// ---------- Base : « 📚 Ma base », sans requête IGDB ----------

/** Jeux affichés par page dans « 📚 Ma base » (section 8) */
export const databasePageSize = 50;

/**
 * Jeux en base hors backlog dont le nom VO, le nom VF ou un titre de version contient la saisie, triés par nom affiché.
 * Saisie vide : tous.
 */
export function searchDatabaseGames(database: Database, query: string): Game[] {
	const normalizedQuery = normalizeText(query.trim());
	return database.games
		.filter(
			(game) =>
				!database.userGames.some(({ gameId }) => gameId === game.id) &&
				[
					game.name,
					game.frenchName,
					...database.versions
						.filter(({ gameId }) => gameId === game.id)
						.map(({ title }) => title),
				].some(
					(text) =>
						text !== null && normalizeText(text).includes(normalizedQuery),
				),
		)
		.toSorted((first, second) =>
			(first.frenchName ?? first.name).localeCompare(
				second.frenchName ?? second.name,
				"fr",
			),
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

	// 1. Remonter de la fiche choisie jusqu'à l'original
	let original = (await fetchNodes(`id = ${igdbId}`)).at(0);
	if (original === undefined) {
		throw new Error(`Fiche IGDB ${igdbId} introuvable.`);
	}
	const visitedIds = new Set([original.id]);
	let parentId = getOriginalParentId(reference, original);
	while (parentId !== undefined && !visitedIds.has(parentId)) {
		// eslint-disable-next-line no-await-in-loop -- chaque parent se lit sur la fiche précédente
		const parent = (await fetchNodes(`id = ${parentId}`)).at(0);
		if (parent === undefined) {
			break;
		}
		visitedIds.add(parent.id);
		original = parent;
		parentId = getOriginalParentId(reference, parent);
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
					message: `« ${candidate.name} » est rattaché comme version, mais son type est « ${typeName} » : fiche ignorée.`,
					entry: candidate,
				});
			}
		}
	}

	// 3. Détail des versions, puis données propres au jeu sur sa fiche originale
	const versions = await requestIgdb<IgdbVersionGame[]>(
		"games",
		`fields name, version_title, game_type.type, cover.image_id, url, platforms.name, platforms.abbreviation, platforms.slug, release_dates.date, release_dates.platform, dlcs, expansions; where id = (${[...versionNodes.keys()].join(",")}); limit 500;`,
		signal,
	);
	const originalGame = (
		await requestIgdb<IgdbOriginalGame[]>(
			"games",
			`fields name, alternative_names.name, alternative_names.comment, first_release_date, game_status, artworks.image_id, collections.name, collections.as_child_relations.parent_collection, franchise.name, franchises.name, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, involved_companies.company.logo.image_id; where id = ${original.id};`,
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

/** Images d'un jeu, une seule requête : à l'ajout au backlog et pour « Personnaliser » (section 8) */
export async function fetchIgdbGameImages(
	gameId: number,
	signal: AbortSignal,
): Promise<IgdbGameImages> {
	const game = (
		await requestIgdb<IgdbGameImages[]>(
			"games",
			`fields cover.image_id, artworks.image_id; where id = ${gameId};`,
			signal,
		)
	).at(0);
	if (game === undefined) {
		throw new Error(`Fiche IGDB ${gameId} introuvable.`);
	}
	return game;
}

/** Seule fonction qui construit l'URL d'une image IGDB ; `t_thumb` (90 × 90) pour une miniature */
export function getIgdbImageUrl(
	imageId: IgdbImageId,
	size: IgdbImageSize,
	isHighDensity = false,
): string {
	return `https://images.igdb.com/igdb/image/upload/t_${size}${isHighDensity ? "_2x" : ""}/${imageId}.jpg`;
}

// ---------- Séries : choix, numéros et ordre (section 8) ----------

/** La série de la base qui porte ce nom, sans tenir compte des accents ni des majuscules */
function findSeriesByName(database: Database, name: string): Series | null {
	const searched = normalizeText(name.trim());
	return (
		database.series.find(
			(series) => normalizeText(series.name.trim()) === searched,
		) ?? null
	);
}

/** Valeur du choix de la série dans sa liste ; sans série proposée par IGDB, « aucune » est la proposition d'IGDB */
export function formatSeriesValue(
	choice: SeriesChoice,
	hasProposedSeries: boolean,
): string {
	switch (choice.kind) {
		case "other":
			return `other-${choice.seriesId}`;
		case "none":
			return hasProposedSeries ? "none" : "proposed";
		default:
			return choice.kind;
	}
}

/** Choix de la série lu dans sa liste ; « Nouvelle série » part d'un nom vide */
export function parseSeriesValue(value: string): SeriesChoice {
	if (value.startsWith("other-")) {
		return { kind: "other", seriesId: Number(value.slice("other-".length)) };
	}
	switch (value) {
		case "none":
			return { kind: "none" };
		case "new":
			return { kind: "new", name: "" };
		default:
			return { kind: "proposed" };
	}
}

/** Une nouvelle série doit avoir un nom */
export function isSeriesChoiceValid(choice: SeriesChoice): boolean {
	return choice.kind !== "new" || choice.name.trim() !== "";
}

/**
 * id de la série choisie (section 8) ; `undefined` pour une nouvelle série, qui n'existe qu'à « Valider ».
 * Un nom déjà pris désigne la série existante.
 */
function getChosenSeriesId(
	database: Database,
	proposedSeriesId: number | null,
	choice: SeriesChoice,
): number | null | undefined {
	switch (choice.kind) {
		case "proposed":
			return proposedSeriesId;
		case "other":
			return choice.seriesId;
		case "new":
			return findSeriesByName(database, choice.name)?.id;
		// none
		default:
			return null;
	}
}

/** id de la série choisie pour un jeu ; `undefined` pour une nouvelle série */
function getDraftSeriesId(
	database: Database,
	gameId: number,
	choice: SeriesChoice,
): number | null | undefined {
	const game = database.games.find(({ id }) => id === gameId);
	return getChosenSeriesId(database, game?.proposedSeriesId ?? null, choice);
}

function sortSeriesEntries(entries: SeriesEntry[]): SeriesEntry[] {
	return entries.toSorted(
		(first, second) => first.seriesNumber - second.seriesNumber,
	);
}

/** Jeux du backlog d'une série, triés par numéro ; sans `excludedGameId` */
function getSeriesEntries(
	database: Database,
	seriesId: number,
	excludedGameId: number | null,
): SeriesEntry[] {
	return sortSeriesEntries(
		database.userGames.flatMap((userGame) =>
			userGame.seriesId === seriesId && userGame.gameId !== excludedGameId
				? [{ gameId: userGame.gameId, seriesNumber: userGame.seriesNumber }]
				: [],
		),
	);
}

/** Numéro après tous les autres (section 8) : l'entier au-dessus du plus grand, 1 pour le premier jeu de la série */
function getNextSeriesNumber(entries: SeriesEntry[]): number {
	return (
		Math.floor(
			Math.max(0, ...entries.map(({ seriesNumber }) => seriesNumber)),
		) + 1
	);
}

/** Les autres jeux du backlog de la série choisie pour un jeu : ils servent à lire et à afficher son numéro */
export function getDraftSeriesEntries(
	database: Database,
	gameId: number,
	choice: SeriesChoice,
): SeriesEntry[] {
	const seriesId = getDraftSeriesId(database, gameId, choice);
	return seriesId === null || seriesId === undefined
		? []
		: getSeriesEntries(database, seriesId, gameId);
}

/**
 * Numéro pré-rempli au choix d'une série (section 8) : aucun sans série ; dans sa série actuelle, le jeu garde le sien ;
 * sinon, il passe après les jeux du backlog de la série. Une nouvelle série commence à 1.
 */
export function getDefaultSeriesNumber(
	database: Database,
	gameId: number,
	choice: SeriesChoice,
): number | null {
	const seriesId = getDraftSeriesId(database, gameId, choice);
	if (seriesId === undefined) {
		return 1;
	}
	if (seriesId === null) {
		return null;
	}
	const userGame = database.userGames.find((other) => other.gameId === gameId);
	return userGame?.seriesId === seriesId
		? userGame.seriesNumber
		: getNextSeriesNumber(getSeriesEntries(database, seriesId, gameId));
}

/** Jeu du backlog qui a déjà le numéro saisi dans la série choisie : « Valider » le décalera (section 8) */
export function findSeriesNumberOwner(
	database: Database,
	gameId: number,
	draft: UserGameDraft,
): Game | null {
	const seriesId = getDraftSeriesId(database, gameId, draft.series);
	const owner =
		seriesId === null || seriesId === undefined
			? undefined
			: getSeriesEntries(database, seriesId, gameId).find(
					({ seriesNumber }) => seriesNumber === draft.seriesNumber,
				);
	return owner === undefined
		? null
		: (database.games.find(({ id }) => id === owner.gameId) ?? null);
}

// Un numéro dans la série est stocké avec 3 décimales : les calculs se font en millièmes, sans erreur d'arrondi
const seriesNumberScale = 1000;

/** Famille d'un numéro (section 8) : sa partie entière, le numéro de son jeu principal */
function getFamily(seriesNumber: number): number {
	return Math.floor(
		Math.round(seriesNumber * seriesNumberScale) / seriesNumberScale,
	);
}

/** Rang de sous-jeu, en millièmes : 0 pour un principal, 100 pour 3.1, 10 pour 3.01 */
function getSubPart(seriesNumber: number): number {
	return Math.round(seriesNumber * seriesNumberScale) % seriesNumberScale;
}

function toSeriesNumber(family: number, subPart: number): number {
	return (family * seriesNumberScale + subPart) / seriesNumberScale;
}

/** Chiffres que demande un rang de sous-jeu : 1 pour 3.1, 2 pour 3.01 ou 3.15, 3 pour 3.001 */
function countSubPartDigits(subPart: number): number {
	if (subPart % 100 === 0) {
		return 1;
	}
	return subPart % 10 === 0 ? 2 : 3;
}

/** Chiffres des sous-jeux d'une famille (section 8) : ceux du plus précis, au moins 1 */
function getFamilyDigits(entries: SeriesEntry[], family: number): number {
	return Math.max(
		1,
		...entries.flatMap(({ seriesNumber }) =>
			getFamily(seriesNumber) === family && getSubPart(seriesNumber) > 0
				? [countSubPartDigits(getSubPart(seriesNumber))]
				: [],
		),
	);
}

/** Un cran de sous-jeu, en millièmes : 100 pour une famille à 1 chiffre (3.1 → 3.2), 10 pour 2 chiffres */
function getSubPartStep(digits: number): number {
	return 10 ** (3 - digits);
}

/** Numéro affiché (section 8) : les sous-jeux d'une famille avec le moins de décimales possible, autant pour tous (3.01 … 3.10) */
export function formatSeriesNumber(
	seriesNumber: number,
	entries: SeriesEntry[],
): string {
	const family = getFamily(seriesNumber);
	const subPart = getSubPart(seriesNumber);
	if (subPart === 0) {
		return String(family);
	}
	const digits = Math.max(
		countSubPartDigits(subPart),
		getFamilyDigits(entries, family),
	);
	return `${family}.${String(subPart / getSubPartStep(digits)).padStart(digits, "0")}`;
}

/**
 * Numéro tapé (section 8) : un entier à partir de 1, ou un sous-jeu jusqu'à 3 décimales ; `null` s'il est refusé.
 * Avec moins de décimales que sa famille, c'est un rang : « 3.1 » parmi 3.01 … 3.10 donne 3.01. Avec plus, la famille en prend
 * autant et ses sous-jeux gardent leur valeur : « 3.15 » parmi 3.1 et 3.2 se place entre les deux.
 */
export function parseSeriesNumber(
	text: string,
	entries: SeriesEntry[],
): number | null {
	const match = /^(\d+)(?:[.,](\d{1,3}))?$/u.exec(text.trim());
	if (match === null) {
		return null;
	}
	const [, familyText = "", decimals = ""] = match;
	const family = Number(familyText);
	if (family < 1) {
		return null;
	}
	if (Number(decimals) === 0) {
		return family;
	}
	const digits = Math.max(decimals.length, getFamilyDigits(entries, family));
	return toSeriesNumber(family, Number(decimals) * getSubPartStep(digits));
}

/** Un numéro à décimales est un sous-jeu (section 8) */
export function isSeriesSubNumber(seriesNumber: number): boolean {
	return getSubPart(seriesNumber) > 0;
}

/** Ce qui bouge avec un jeu (section 8) : un principal emmène les sous-jeux de sa famille ; un sous-jeu bouge seul */
function getSeriesBlock(entries: SeriesEntry[], gameId: number): SeriesEntry[] {
	const moved = entries.find((entry) => entry.gameId === gameId);
	if (moved === undefined) {
		return [];
	}
	const family = getFamily(moved.seriesNumber);
	return getSubPart(moved.seriesNumber) === 0
		? [
				moved,
				...entries.filter(
					({ seriesNumber }) =>
						getFamily(seriesNumber) === family && getSubPart(seriesNumber) > 0,
				),
			]
		: [moved];
}

function hasMain(entries: SeriesEntry[], family: number): boolean {
	return entries.some(
		({ seriesNumber }) =>
			getFamily(seriesNumber) === family && getSubPart(seriesNumber) === 0,
	);
}

function isSubPartUsed(
	entries: SeriesEntry[],
	family: number,
	subPart: number,
): boolean {
	return entries.some(
		({ seriesNumber }) =>
			getFamily(seriesNumber) === family &&
			getSubPart(seriesNumber) === subPart,
	);
}

/**
 * Libère la famille `family` (section 8) : elle avance (`direction` 1) ou recule (-1) d'un numéro avec ses sous-jeux,
 * et les familles suivantes, ou précédentes, tant qu'elles se heurtent ; un numéro libre arrête le décalage
 */
function shiftFamilies(
	entries: SeriesEntry[],
	family: number,
	direction: 1 | -1,
): SeriesEntry[] {
	const shifted = new Set<number>();
	for (
		let current = family;
		entries.some(({ seriesNumber }) => getFamily(seriesNumber) === current);
		current += direction
	) {
		shifted.add(current);
	}
	return entries.map((entry) => {
		const entryFamily = getFamily(entry.seriesNumber);
		return shifted.has(entryFamily)
			? {
					...entry,
					seriesNumber: toSeriesNumber(
						entryFamily + direction,
						getSubPart(entry.seriesNumber),
					),
				}
			: entry;
	});
}

/** Un chiffre de plus pour les sous-jeux d'une famille, à rangs égaux (section 8) : 3.1 … 3.9 deviennent 3.01 … 3.09 ; `null` à 3 chiffres */
function widenFamily(
	entries: SeriesEntry[],
	family: number,
): SeriesEntry[] | null {
	if (getFamilyDigits(entries, family) === 3) {
		return null;
	}
	return entries.map((entry) =>
		getFamily(entry.seriesNumber) === family &&
		getSubPart(entry.seriesNumber) > 0
			? {
					...entry,
					seriesNumber: toSeriesNumber(
						family,
						getSubPart(entry.seriesNumber) / 10,
					),
				}
			: entry,
	);
}

/**
 * Range un sous-jeu au rang `subPart` de sa famille (section 8). Un rang pris est libéré : son sous-jeu avance (`direction` 1)
 * ou recule (-1) d'un cran, avec les suivants, ou précédents, tant qu'ils se heurtent. Avancer au-delà du dernier rang
 * (3.9, 3.99) fait d'abord passer la famille à un chiffre de plus. `null` au-delà de 3.999.
 */
function insertSub(
	entries: SeriesEntry[],
	gameId: number,
	family: number,
	subPart: number,
	direction: 1 | -1,
): SeriesEntry[] | null {
	const step =
		direction *
		getSubPartStep(
			Math.max(getFamilyDigits(entries, family), countSubPartDigits(subPart)),
		);
	const shifted = new Set<number>();
	let current = subPart;
	for (; isSubPartUsed(entries, family, current); current += step) {
		shifted.add(current);
	}
	if (current >= seriesNumberScale) {
		const widened = widenFamily(entries, family);
		return widened === null
			? null
			: insertSub(widened, gameId, family, subPart / 10, direction);
	}
	return [
		...entries.map((entry) =>
			getFamily(entry.seriesNumber) === family &&
			shifted.has(getSubPart(entry.seriesNumber))
				? {
						...entry,
						seriesNumber: toSeriesNumber(
							family,
							getSubPart(entry.seriesNumber) + step,
						),
					}
				: entry,
		),
		{ gameId, seriesNumber: toSeriesNumber(family, subPart) },
	];
}

/** Range un sous-jeu au rang qui suit celui de `afterGameId` (0 : son principal), en libérant ce rang vers le haut s'il est pris */
function insertSubAfter(
	entries: SeriesEntry[],
	gameId: number,
	family: number,
	afterGameId: number,
): SeriesEntry[] | null {
	const after = entries.find((entry) => entry.gameId === afterGameId);
	const afterSubPart = after === undefined ? 0 : getSubPart(after.seriesNumber);
	const subPart =
		afterSubPart + getSubPartStep(getFamilyDigits(entries, family));
	if (subPart >= seriesNumberScale) {
		const widened = widenFamily(entries, family);
		return widened === null
			? null
			: insertSubAfter(widened, gameId, family, afterGameId);
	}
	return insertSub(entries, gameId, family, subPart, 1);
}

/** Range des jeux à la suite comme sous-jeux, après `afterGameId` */
function insertSubsAfter(
	entries: SeriesEntry[],
	items: SeriesEntry[],
	family: number,
	afterGameId: number,
): SeriesEntry[] | null {
	let placed: SeriesEntry[] | null = entries;
	let previousGameId = afterGameId;
	for (const { gameId } of items) {
		placed =
			placed === null
				? null
				: insertSubAfter(placed, gameId, family, previousGameId);
		previousGameId = gameId;
	}
	return placed;
}

/**
 * Range un jeu principal et ses sous-jeux à la famille `family` (section 8). Un principal déjà là est décalé avec sa famille,
 * vers le haut (`direction` 1) ou le bas (-1). Ses sous-jeux gardent leur rang ; des sous-jeux orphelins déjà là restent et l'accueillent.
 */
function insertFamily(
	entries: SeriesEntry[],
	block: SeriesEntry[],
	family: number,
	direction: 1 | -1,
): SeriesEntry[] | null {
	const [head, ...subs] = block;
	if (head === undefined) {
		return entries;
	}
	let placed: SeriesEntry[] | null = [
		...(hasMain(entries, family)
			? shiftFamilies(entries, family, direction)
			: entries),
		{ gameId: head.gameId, seriesNumber: family },
	];
	for (const { gameId, seriesNumber } of subs) {
		placed =
			placed === null
				? null
				: insertSub(placed, gameId, family, getSubPart(seriesNumber), 1);
	}
	return placed;
}

/**
 * Numéro tapé dans « Réorganiser la série », « Personnaliser » ou l'ajout au backlog (section 8) : un numéro pris est libéré
 * vers le haut. Un principal emmène ses sous-jeux ; devenu sous-jeu, il les range à sa suite. Un jeu absent de `entries` y entre.
 */
export function placeSeriesEntry(
	entries: SeriesEntry[],
	gameId: number,
	seriesNumber: number,
): SeriesEntry[] {
	const found = getSeriesBlock(entries, gameId);
	const block = found.length === 0 ? [{ gameId, seriesNumber }] : found;
	const blockIds = new Set(block.map((entry) => entry.gameId));
	const rest = entries.filter((entry) => !blockIds.has(entry.gameId));
	const family = getFamily(seriesNumber);
	const subPart = getSubPart(seriesNumber);
	const [head, ...subs] = block;
	if (head === undefined) {
		return entries;
	}
	let placed: SeriesEntry[] | null;
	if (subPart === 0) {
		placed = insertFamily(rest, block, family, 1);
	} else {
		const headPlaced = insertSub(rest, head.gameId, family, subPart, 1);
		placed =
			headPlaced === null
				? null
				: insertSubsAfter(headPlaced, subs, family, head.gameId);
	}
	return placed === null ? entries : sortSeriesEntries(placed);
}

/**
 * Le trait de dépôt (section 8) : `gapIndex`, sa place entre deux lignes (0 : tout en haut), et `wantsSub`, le glisser décalé
 * à droite. Tout en haut, le jeu est principal ; entre deux jeux d'une même famille, sous-jeu ; ailleurs, selon `wantsSub`.
 */
export function getSeriesDrop(
	entries: SeriesEntry[],
	gameId: number,
	gapIndex: number,
	wantsSub: boolean,
): SeriesDrop {
	const block = getSeriesBlock(entries, gameId);
	const blockIds = new Set(block.map((entry) => entry.gameId));
	const rest = entries.filter((entry) => !blockIds.has(entry.gameId));
	const restGapIndex = entries
		.slice(0, gapIndex)
		.filter((entry) => !blockIds.has(entry.gameId)).length;
	const above = restGapIndex === 0 ? null : (rest.at(restGapIndex - 1) ?? null);
	const below = rest.at(restGapIndex) ?? null;
	const isInsideFamily =
		above !== null &&
		below !== null &&
		getFamily(above.seriesNumber) === getFamily(below.seriesNumber) &&
		getSubPart(below.seriesNumber) > 0;
	return {
		block,
		rest,
		above,
		isSub: above !== null && (isInsideFamily || wantsSub),
		isMovingDown:
			entries.findIndex((entry) => entry.gameId === gameId) < gapIndex,
	};
}

/**
 * Glisser-déposer de « Réorganiser la série » (section 8). Le jeu prend le premier numéro libre juste après le jeu du dessus
 * (principal : l'entier suivant sa famille, 1 tout en haut ; sous-jeu : le rang suivant), et personne d'autre ne bouge.
 * Ce numéro pris : en descendant au même niveau, le jeu prend la place du jeu du dessus et les jeux dépassés reculent d'un cran ;
 * sinon, il prend ce numéro et celui qui l'avait avance d'un cran. Dans les deux cas, en cascade, jusqu'à un trou.
 */
export function dropSeriesEntry(
	entries: SeriesEntry[],
	gameId: number,
	gapIndex: number,
	wantsSub: boolean,
): SeriesEntry[] {
	const { block, rest, above, isSub, isMovingDown } = getSeriesDrop(
		entries,
		gameId,
		gapIndex,
		wantsSub,
	);
	const [head, ...subs] = block;
	if (head === undefined) {
		return entries;
	}
	const isMain = getSubPart(head.seriesNumber) === 0;
	let placed: SeriesEntry[] | null;
	if (above === null || !isSub) {
		const aboveFamily = above === null ? 0 : getFamily(above.seriesNumber);
		// Sans place libre, un principal qui descend prend celle de la famille du dessus, qui recule
		const isPulling =
			isMain &&
			isMovingDown &&
			hasMain(rest, aboveFamily + 1) &&
			hasMain(rest, aboveFamily);
		placed = isPulling
			? insertFamily(rest, block, aboveFamily, -1)
			: insertFamily(rest, block, aboveFamily + 1, 1);
	} else {
		const family = getFamily(above.seriesNumber);
		const nextSubPart =
			getSubPart(above.seriesNumber) +
			getSubPartStep(getFamilyDigits(rest, family));
		// Sans rang libre, un sous-jeu qui descend dans sa famille prend le rang du dessus, qui recule
		const isPulling =
			!isMain &&
			isMovingDown &&
			getFamily(head.seriesNumber) === family &&
			(nextSubPart >= seriesNumberScale ||
				isSubPartUsed(rest, family, nextSubPart));
		placed = isPulling
			? insertSub(rest, head.gameId, family, getSubPart(above.seriesNumber), -1)
			: insertSubsAfter(rest, [head, ...subs], family, above.gameId);
	}
	return placed === null ? entries : sortSeriesEntries(placed);
}

/**
 * Incohérences de « Réorganiser la série » (section 8) : pour chaque jeu sorti avant un jeu placé plus haut, le plus récent de ceux-là.
 * Un jeu sans date de sortie n'est pas comparé.
 */
export function getSeriesOrderConflicts(
	database: Database,
	entries: SeriesEntry[],
): Map<number, Game> {
	const conflicts = new Map<number, Game>();
	let latest: { game: Game; date: IsoDate } | null = null;
	for (const { gameId } of entries) {
		const game = database.games.find(({ id }) => id === gameId);
		const date = game?.firstReleaseDate ?? null;
		if (game !== undefined && date !== null) {
			if (latest !== null && date < latest.date) {
				conflicts.set(gameId, latest.game);
			} else {
				latest = { game, date };
			}
		}
	}
	return conflicts;
}

/** « Réorganiser la série » sur la série d'un jeu du backlog ; aucune modale sans série */
export function getReorderSeriesModal(
	database: Database,
	gameId: number,
): Extract<Modal, { kind: "reorderSeries" }> | null {
	const seriesId =
		database.userGames.find((userGame) => userGame.gameId === gameId)
			?.seriesId ?? null;
	return seriesId === null
		? null
		: {
				kind: "reorderSeries",
				seriesId,
				gameId,
				entries: getSeriesEntries(database, seriesId, null),
			};
}

// ---------- Modales : versions, DLC et plateformes ----------

/** Valeurs d'une nouvelle version jouée : Pas commencé, cases décochées, compteurs et temps à 0, le reste vide */
export const defaultUserVersionDraft: UserVersionDraft = {
	versionId: null,
	platformId: null,
	status: "notStarted",
	isOwned: false,
	isUpNext: false,
	finishDate: null,
	sureFinishCount: 0,
	probableFinishCount: 0,
	trackedPlayTimeMinutes: 0,
	estimatedPlayTimeMinutes: 0,
	rating: null,
	comment: null,
	doneDlcIds: [],
};

/** Aucune case cochée, en attendant les données IGDB */
export const emptyImportSelection: ImportSelection = {
	versionIds: [],
	dlcIds: [],
	dlcAsGameIds: [],
};

export function findUserGame(
	database: Database,
	gameId: number,
): UserGame | null {
	return (
		database.userGames.find((userGame) => userGame.gameId === gameId) ?? null
	);
}

/** Personnalisation par défaut à l'ajout au backlog (section 8) : l'image donnée, Histoire, la série proposée par IGDB et son numéro par défaut */
function getDefaultUserGameDraft(
	database: Database,
	gameId: number,
	imageId: IgdbImageId | null,
): UserGameDraft {
	const series: SeriesChoice = { kind: "proposed" };
	return {
		imageId,
		endingType: "story",
		series,
		seriesNumber: getDefaultSeriesNumber(database, gameId, series),
	};
}

function getSeriesChoice(
	proposedSeriesId: number | null,
	seriesId: number | null,
): SeriesChoice {
	if (seriesId === proposedSeriesId) {
		return { kind: "proposed" };
	}
	return seriesId === null ? { kind: "none" } : { kind: "other", seriesId };
}

/** Personnalisation d'un jeu du backlog, reprise dans « Personnaliser » */
export function getUserGameDraft(
	game: Game,
	userGame: UserGame,
): UserGameDraft {
	return {
		imageId: userGame.imageId,
		endingType: userGame.endingType,
		series: getSeriesChoice(game.proposedSeriesId, userGame.seriesId),
		seriesNumber: userGame.seriesNumber,
	};
}

/**
 * Ajout au backlog (section 8) : version, plateforme et données du joueur ; la personnalisation en plus si le jeu n'y est pas encore.
 * Ses images viennent de l'ajout du jeu qui précède (`imageIds`), sinon d'IGDB, relu à l'ouverture : en attendant, la cover de l'original.
 */
export function getAddUserVersionModal(
	database: Database,
	gameId: number,
	versionId: number | null,
	imageIds: IgdbImageId[] | null,
	queuedGameIds: number[],
): Extract<Modal, { kind: "addUserVersion" }> {
	const isInBacklog = findUserGame(database, gameId) !== null;
	const defaultImageId =
		imageIds === null
			? (database.versions.find(({ id }) => id === gameId)?.coverImageId ??
				null)
			: (imageIds.at(0) ?? null);
	return {
		kind: "addUserVersion",
		gameId,
		draft: { ...defaultUserVersionDraft, versionId },
		userGameDraft: isInBacklog
			? null
			: getDefaultUserGameDraft(database, gameId, defaultImageId),
		imageIds: isInBacklog ? [] : imageIds,
		queuedGameIds,
	};
}

/**
 * Modale d'un jeu choisi par son id IGDB (section 8) : déjà en base, l'ajout au backlog, sa version pré-sélectionnée ;
 * sinon la modale d'ajout
 */
export function getGameModal(
	database: Database,
	igdbId: number,
	queuedGameIds: number[],
): Modal {
	const version = database.versions.find(({ id }) => id === igdbId);
	return version === undefined
		? {
				kind: "addGame",
				igdbId,
				gameImport: null,
				selection: emptyImportSelection,
				isAddingToBacklog: true,
				queuedGameIds,
			}
		: getAddUserVersionModal(
				database,
				version.gameId,
				version.id,
				null,
				queuedGameIds,
			);
}

/** File des DLC à ajouter comme jeux, portée par la modale ouverte (section 8) */
export function getQueuedGameIds(modal: Modal | null): number[] {
	return modal !== null && "queuedGameIds" in modal ? modal.queuedGameIds : [];
}

/** Modale qui suit la fin d'une étape : l'ajout du prochain DLC de la file comme jeu, sinon aucune */
export function getNextQueuedModal(
	database: Database,
	queuedGameIds: number[],
): Modal | null {
	const [igdbId, ...nextQueuedGameIds] = queuedGameIds;
	return igdbId === undefined
		? null
		: getGameModal(database, igdbId, nextQueuedGameIds);
}

/** DLC cochés « comme jeu », dans l'ordre de la liste des DLC */
export function getDlcAsGameQueue(
	dlcs: Dlc[],
	selection: ImportSelection,
): number[] {
	return dlcs
		.filter(({ id }) => selection.dlcAsGameIds.includes(id))
		.map(({ id }) => id);
}

/** Coche ou décoche un id */
export function toggleId(ids: number[], id: number): number[] {
	return ids.includes(id) ? ids.filter((other) => other !== id) : [...ids, id];
}

/** Range les données IGDB dans la modale d'ajout si elle attend toujours cette fiche : version originale et tous les DLC cochés */
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
	return {
		...modal,
		gameImport,
		selection: {
			versionIds: [gameImport.game.id],
			dlcIds: gameImport.dlcs.map(({ id }) => id),
			dlcAsGameIds: [],
		},
	};
}

/** Range les données IGDB dans « Modifier le jeu » si elle attend toujours ce jeu ; rien n'est coché */
export function receiveEditGameImport(
	modal: Modal | null,
	gameId: number,
	gameImport: GameImport,
): Modal | null {
	if (
		modal?.kind !== "editGame" ||
		modal.gameId !== gameId ||
		modal.gameImport !== null
	) {
		return modal;
	}
	return { ...modal, gameImport };
}

/**
 * Range les images IGDB dans l'ajout au backlog ou « Personnaliser » si la modale attend toujours ce jeu.
 * L'image déjà choisie reste proposée, même si IGDB ne l'a plus ; sans choix, la première est pré-sélectionnée.
 */
export function receiveGameImages(
	modal: Modal | null,
	gameId: number,
	imageIds: IgdbImageId[],
): Modal | null {
	if (
		!(
			(modal?.kind === "addUserVersion" && modal.userGameDraft !== null) ||
			modal?.kind === "customizeGame"
		) ||
		modal.gameId !== gameId ||
		modal.imageIds !== null
	) {
		return modal;
	}
	const draft =
		modal.kind === "customizeGame" ? modal.draft : modal.userGameDraft;
	if (draft === null) {
		return modal;
	}
	const { imageId } = draft;
	const proposedImageIds =
		imageId === null || imageIds.includes(imageId)
			? imageIds
			: [imageId, ...imageIds];
	const receivedDraft = {
		...draft,
		imageId: imageId ?? proposedImageIds.at(0) ?? null,
	};
	return modal.kind === "customizeGame"
		? { ...modal, draft: receivedDraft, imageIds: proposedImageIds }
		: { ...modal, userGameDraft: receivedDraft, imageIds: proposedImageIds };
}

/** Range les DLC IGDB dans « Rechercher d'autres DLC » si elle attend toujours ce jeu ; rien n'est coché */
export function receiveGameDlcs(
	modal: Modal | null,
	gameId: number,
	dlcs: Dlc[],
): Modal | null {
	if (
		modal?.kind !== "addDlcs" ||
		modal.gameId !== gameId ||
		modal.dlcs !== null
	) {
		return modal;
	}
	return { ...modal, dlcs };
}

/** Les données IGDB réduites aux cases cochées : la version originale et les versions choisies, leurs plateformes, les DLC choisis */
export function keepSelection(
	gameImport: GameImport,
	selection: ImportSelection,
): GameImport {
	const keptIds = [gameImport.game.id, ...selection.versionIds];
	const versionPlatforms = gameImport.versionPlatforms.filter(({ versionId }) =>
		keptIds.includes(versionId),
	);
	return {
		...gameImport,
		versions: gameImport.versions.filter(({ id }) => keptIds.includes(id)),
		versionPlatforms,
		platforms: gameImport.platforms.filter(({ id }) =>
			versionPlatforms.some(({ platformId }) => platformId === id),
		),
		dlcs: gameImport.dlcs.filter(({ id }) => selection.dlcIds.includes(id)),
	};
}

/** Plateformes proposées pour une version jouée (section 5) : celles de la version, puis les émulateurs de ces consoles */
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
				platforms.find(({ id }) => id === platformId)?.shortName ?? [],
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
				platforms.find(({ id }) => id === platformId)?.shortName ??
				`#${platformId}`;
			return `${name} ${releaseDate === null ? "(date inconnue)" : formatIsoDate(releaseDate)}`;
		})
		.join(" · ");
}

// ---------- Données et statuts ----------

export function findById<T extends { id: number }>(
	items: T[],
	id: number | null,
): T | null {
	return id === null ? null : (items.find((item) => item.id === id) ?? null);
}

function getStatusRank(status: Status): number | null {
	return statusDefinitions.find(({ key }) => key === status)?.rank ?? null;
}

/** Rang 5 ou plus : la version jouée est finie (section 6) */
export function isFinishedStatus(status: Status): boolean {
	return (getStatusRank(status) ?? 0) >= 5;
}

/** Les statuts proposés dépendent du type de fin du jeu (section 6) */
export function isStatusAllowed(
	status: Status,
	endingType: EndingType,
): boolean {
	return statusDefinitions.some((definition) => {
		const endingTypes: readonly EndingType[] = definition.endingTypes;
		return definition.key === status && endingTypes.includes(endingType);
	});
}

/** Statut devenu incompatible avec un nouveau type de fin (section 8) : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé */
export function convertStatus(status: Status, endingType: EndingType): Status {
	if (isStatusAllowed(status, endingType)) {
		return status;
	}
	if (status === "finished") {
		return "deemedFinished";
	}
	if (status === "deemedFinished") {
		return "finished";
	}
	if (status === "watched") {
		return "notStarted";
	}
	return status;
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

/** id interne de la prochaine version jouée créée */
export function getNextUserVersionId(database: Database): number {
	return Math.max(0, ...database.userVersions.map(({ id }) => id)) + 1;
}

/** Au rang 5 ou plus, « fois fini (sûr) » passe à 1 s'il était à 0 (section 6) */
function applyFirstFinish(userVersion: UserVersion): UserVersion {
	return isFinishedStatus(userVersion.status) &&
		userVersion.sureFinishCount === 0
		? { ...userVersion, sureFinishCount: 1 }
		: userVersion;
}

/**
 * Ajoute une version jouée avec les données pré-remplies et ses DLC faits, sauf si la même version + plateforme existe déjà (section 5).
 * Son statut suit les règles d'un changement de statut (section 6).
 */
export function addUserVersion(
	database: Database,
	versionId: number,
	platformId: number,
	draft: UserVersionDraft,
): Database {
	if (
		database.userVersions.some(
			(userVersion) =>
				userVersion.versionId === versionId &&
				userVersion.platformId === platformId,
		)
	) {
		return database;
	}
	const { doneDlcIds, ...data } = draft;
	const userVersionId = getNextUserVersionId(database);
	return {
		...database,
		userVersions: [
			...database.userVersions,
			applyFirstFinish({ ...data, id: userVersionId, versionId, platformId }),
		],
		doneDlcs: [
			...database.doneDlcs,
			...doneDlcIds.map((dlcId) => ({ userVersionId, dlcId })),
		],
	};
}

/** La série de la base qui correspond à celle proposée par IGDB : même collection, ou même franchise */
export function findStoredSeries(
	database: Database,
	igdbSeries: Omit<Series, "id">,
): Series | null {
	return (
		database.series.find(
			({ igdbCollectionId, igdbFranchiseId }) =>
				(igdbCollectionId !== null &&
					igdbCollectionId === igdbSeries.igdbCollectionId) ||
				(igdbFranchiseId !== null &&
					igdbFranchiseId === igdbSeries.igdbFranchiseId),
		) ?? null
	);
}

function getNextSeriesId(database: Database): number {
	return Math.max(0, ...database.series.map(({ id }) => id)) + 1;
}

/** Ajoute la série si elle manque : la proposée par IGDB, ou une nouvelle série nommée à la main */
function storeSeries(
	database: Database,
	series: Omit<Series, "id">,
	storedSeries: Series | null,
): { database: Database; seriesId: number } {
	if (storedSeries !== null) {
		return { database, seriesId: storedSeries.id };
	}
	const seriesId = getNextSeriesId(database);
	return {
		database: {
			...database,
			series: [...database.series, { id: seriesId, ...series }],
		},
		seriesId,
	};
}

/** Une série qu'aucun jeu ne propose et qu'aucun jeu du backlog n'a choisie quitte la base */
function removeUnusedSeries(database: Database): Database {
	return {
		...database,
		series: database.series.filter(
			({ id }) =>
				database.games.some(
					({ proposedSeriesId }) => proposedSeriesId === id,
				) || database.userGames.some(({ seriesId }) => seriesId === id),
		),
	};
}

/**
 * « Valider » de la modale d'ajout (section 8) : le jeu, les versions et DLC cochés (`keepSelection`), sa série proposée
 * et ses sociétés, sans doublon. L'ajout au backlog suit, à part.
 * Un jeu déjà en base garde ses versions : seules les fiches manquantes s'ajoutent (aussi pour « Modifier le jeu »).
 */
export function addGameImport(
	database: Database,
	gameImport: GameImport,
): Database {
	const newVersionIds = new Set(
		gameImport.versions
			.filter(({ id }) => findById(database.versions, id) === null)
			.map(({ id }) => id),
	);
	const merged: Database = {
		...database,
		versions: mergeById(database.versions, gameImport.versions),
		versionPlatforms: [
			...database.versionPlatforms,
			...gameImport.versionPlatforms.filter(({ versionId }) =>
				newVersionIds.has(versionId),
			),
		],
		platforms: mergeById(database.platforms, gameImport.platforms),
		dlcs: mergeById(database.dlcs, gameImport.dlcs),
		companies: mergeById(
			database.companies,
			[gameImport.developer, gameImport.publisher].flatMap(
				(company) => company ?? [],
			),
		),
	};
	if (findById(database.games, gameImport.game.id) !== null) {
		return merged;
	}
	// Nouveau jeu : la série proposée par IGDB entre en base avec lui
	const { proposedSeries } = gameImport;
	const stored =
		proposedSeries === null
			? { database: merged, seriesId: null }
			: storeSeries(
					merged,
					proposedSeries,
					findStoredSeries(merged, proposedSeries),
				);
	return {
		...stored.database,
		games: [
			...stored.database.games,
			{ ...gameImport.game, proposedSeriesId: stored.seriesId },
		],
	};
}

export function getGameUserVersionIds(
	database: Database,
	gameId: number,
): number[] {
	const versionIds = database.versions
		.filter((version) => version.gameId === gameId)
		.map(({ id }) => id);
	return database.userVersions
		.filter(({ versionId }) => versionIds.includes(versionId))
		.map(({ id }) => id);
}

/** Reporte les numéros donnés sur les jeux du backlog d'une série */
function setSeriesNumbers(
	userGames: UserGame[],
	entries: SeriesEntry[],
): UserGame[] {
	return userGames.map((userGame) => {
		const entry = entries.find(({ gameId }) => gameId === userGame.gameId);
		return entry === undefined || userGame.seriesId === null
			? userGame
			: { ...userGame, seriesNumber: entry.seriesNumber };
	});
}

/**
 * Personnalisation d'un jeu du backlog, à l'ajout au backlog ou par « Personnaliser » (section 8) : la série choisie,
 * créée si besoin, et sans série, pas de numéro. Un numéro déjà pris dans la série décale celui qui l'avait vers le haut,
 * et les suivants si besoin. Les statuts que le type de fin rend incompatibles sont convertis.
 */
export function saveUserGame(
	database: Database,
	gameId: number,
	draft: UserGameDraft,
): Database {
	const game = findById(database.games, gameId);
	if (game === null) {
		return database;
	}
	const { series, seriesNumber, ...choices } = draft;
	const chosen =
		series.kind === "new"
			? storeSeries(
					database,
					{
						name: series.name.trim(),
						igdbCollectionId: null,
						igdbFranchiseId: null,
					},
					findSeriesByName(database, series.name),
				)
			: {
					database,
					seriesId:
						getChosenSeriesId(database, game.proposedSeriesId, series) ?? null,
				};
	// Rangé dans sa série comme un numéro tapé : les jeux déplacés suivent, et une famille élargie change aussi le sien
	const seriesEntries =
		chosen.seriesId === null
			? []
			: placeSeriesEntry(
					getSeriesEntries(chosen.database, chosen.seriesId, null),
					gameId,
					seriesNumber ??
						getNextSeriesNumber(
							getSeriesEntries(chosen.database, chosen.seriesId, gameId),
						),
				);
	const placedNumber = seriesEntries.find(
		(entry) => entry.gameId === gameId,
	)?.seriesNumber;
	const userGame: UserGame =
		chosen.seriesId === null || placedNumber === undefined
			? { ...choices, gameId, seriesId: null, seriesNumber: null }
			: {
					...choices,
					gameId,
					seriesId: chosen.seriesId,
					seriesNumber: placedNumber,
				};
	const userGames = setSeriesNumbers(chosen.database.userGames, seriesEntries);
	const userVersionIds = getGameUserVersionIds(chosen.database, gameId);
	return removeUnusedSeries({
		...chosen.database,
		userGames:
			findUserGame(chosen.database, gameId) === null
				? [...userGames, userGame]
				: userGames.map((other) =>
						other.gameId === gameId ? userGame : other,
					),
		userVersions: chosen.database.userVersions.map((userVersion) =>
			userVersionIds.includes(userVersion.id)
				? {
						...userVersion,
						status: convertStatus(userVersion.status, userGame.endingType),
					}
				: userVersion,
		),
	});
}

/** « Réorganiser la série » (section 8) : les nouveaux numéros de ses jeux, en une seule action */
export function saveSeriesNumbers(
	database: Database,
	entries: SeriesEntry[],
): Database {
	return {
		...database,
		userGames: setSeriesNumbers(database.userGames, entries),
	};
}

/** « Rechercher d'autres DLC » (section 9) : les DLC cochés rejoignent leur jeu, sans doublon */
export function addDlcs(database: Database, dlcs: Dlc[]): Database {
	return { ...database, dlcs: mergeById(database.dlcs, dlcs) };
}

export function updateUserVersion(
	database: Database,
	userVersionId: number,
	update: (userVersion: UserVersion) => UserVersion,
): Database {
	return {
		...database,
		userVersions: database.userVersions.map((userVersion) =>
			userVersion.id === userVersionId ? update(userVersion) : userVersion,
		),
	};
}

/** Statut d'une version jouée ; au rang 5 ou plus, « fois fini (sûr) » passe à 1 s'il était à 0 (section 6) */
export function setUserVersionStatus(
	database: Database,
	userVersionId: number,
	status: Status,
): Database {
	return updateUserVersion(database, userVersionId, (userVersion) =>
		applyFirstFinish({ ...userVersion, status }),
	);
}

/** Coche ou décoche un DLC comme fait sur une version jouée */
export function toggleDoneDlc(
	database: Database,
	userVersionId: number,
	dlcId: number,
): Database {
	function isThisDlc(doneDlc: DoneDlc): boolean {
		return doneDlc.userVersionId === userVersionId && doneDlc.dlcId === dlcId;
	}
	return {
		...database,
		doneDlcs: database.doneDlcs.some(isThisDlc)
			? database.doneDlcs.filter((doneDlc) => !isThisDlc(doneDlc))
			: [...database.doneDlcs, { userVersionId, dlcId }],
	};
}

/**
 * Retire des versions jouées et leurs DLC faits (section 8). Un jeu sans version jouée quitte le backlog avec sa personnalisation,
 * mais reste en base ; une série créée à la main qui n'a plus de jeu part avec lui.
 */
export function removeUserVersions(
	database: Database,
	userVersionIds: number[],
): Database {
	const userVersions = database.userVersions.filter(
		({ id }) => !userVersionIds.includes(id),
	);
	const playedGameIds = new Set(
		userVersions.flatMap(
			({ versionId }) => findById(database.versions, versionId)?.gameId ?? [],
		),
	);
	return removeUnusedSeries({
		...database,
		userGames: database.userGames.filter(({ gameId }) =>
			playedGameIds.has(gameId),
		),
		userVersions,
		doneDlcs: database.doneDlcs.filter(
			({ userVersionId }) => !userVersionIds.includes(userVersionId),
		),
	});
}

/** « Modifier le jeu » change-t-il la base (section 8) : une version ou un DLC absent de la base coché */
export function hasGameEditChanges(
	database: Database,
	modal: Extract<Modal, { kind: "editGame" }>,
): boolean {
	const { selection } = modal;
	return (
		selection.versionIds.some(
			(id) => findById(database.versions, id) === null,
		) || selection.dlcIds.some((id) => findById(database.dlcs, id) === null)
	);
}

/** « Personnaliser » change-t-il la base (section 8) : un nouveau choix d'image, de type de fin, de série ou de numéro */
export function hasUserGameChanges(
	database: Database,
	gameId: number,
	draft: UserGameDraft,
): boolean {
	const game = findById(database.games, gameId);
	const userGame = findUserGame(database, gameId);
	if (game === null || userGame === null) {
		return false;
	}
	// Une nouvelle série (`undefined`) est toujours un changement ; sans série, le numéro ne compte pas
	const seriesId = getChosenSeriesId(
		database,
		game.proposedSeriesId,
		draft.series,
	);
	return (
		draft.imageId !== userGame.imageId ||
		draft.endingType !== userGame.endingType ||
		seriesId !== userGame.seriesId ||
		(seriesId === null ? null : draft.seriesNumber) !== userGame.seriesNumber
	);
}

/** « Réorganiser la série » change-t-il la base (section 8) : un numéro déplacé */
export function hasSeriesOrderChanges(
	database: Database,
	entries: SeriesEntry[],
): boolean {
	return entries.some(
		({ gameId, seriesNumber }) =>
			findUserGame(database, gameId)?.seriesNumber !== seriesNumber,
	);
}

/**
 * « Logger cette ligne » (section 9) : le jeu, sa personnalisation, ses versions et ses versions jouées tels qu'ils sont stockés ;
 * une sous-ligne s'en tient à sa version jouée
 */
export function getRowData(
	database: Database,
	gameId: number,
	userVersionId: number | null,
): {
	game: Game | null;
	userGame: UserGame | null;
	versions: Version[];
	userVersions: UserVersion[];
} {
	const versions = database.versions.filter(
		(version) => version.gameId === gameId,
	);
	const userVersions = database.userVersions.filter(
		(userVersion) =>
			versions.some(({ id }) => id === userVersion.versionId) &&
			(userVersionId === null || userVersion.id === userVersionId),
	);
	return {
		game: findById(database.games, gameId),
		userGame: findUserGame(database, gameId),
		versions:
			userVersionId === null
				? versions
				: versions.filter(({ id }) =>
						userVersions.some((userVersion) => userVersion.versionId === id),
					),
		userVersions,
	};
}

// ---------- Tableau : agrégats et affichage (sections 6, 7 et 9) ----------

/** Défilement infini : nombre de jeux par page */
export const backlogPageSize = 25;

/** Mode édition : retour automatique en lecture seule après 1 minute d'inactivité (section 9) */
export const editModeIdleMs = 60_000;

export function getStatusLabel(status: Status): string {
	return statusDefinitions.find(({ key }) => key === status)?.label ?? status;
}

export function getEndingTypeLabel(endingType: EndingType): string {
	return (
		endingTypeDefinitions.find(({ key }) => key === endingType)?.label ??
		endingType
	);
}

/** Le statut de plus haut rang ; « Abandonné », hors échelle, n'est jamais retenu */
function getHighestStatus(statuses: Status[]): Status | null {
	let highest: Status | null = null;
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
 * Statut de la ligne du jeu (section 6) : les « Pas commencé » sont ignorées tant qu'une autre version jouée
 * a un statut, puis la première situation qui correspond l'emporte. `null` : impossible de choisir.
 */
export function getGameStatus(statuses: Status[]): Status | null {
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

// ---------- Tri, filtres et colonnes (section 9) ----------

/** Sorte de filtre de chaque colonne ; la miniature et les actions n'ont ni filtre ni tri */
export const columnFilterKinds: Record<ColumnKey, ColumnFilter["kind"] | null> =
	{
		thumbnail: null,
		name: "text",
		series: "text",
		seriesNumber: "numberRange",
		developer: "text",
		publisher: "text",
		releaseDate: "dateRange",
		endingType: "value",
		platform: "value",
		status: "value",
		upNext: "boolean",
		owned: "boolean",
		finishDate: "dateRange",
		finishCount: "numberRange",
		dlc: "numberRange",
		trackedPlayTime: "numberRange",
		estimatedPlayTime: "numberRange",
		totalPlayTime: "numberRange",
		rating: "numberRange",
		comment: "text",
		actions: null,
	};

export function isSortableColumn(column: ColumnKey): boolean {
	return columnFilterKinds[column] !== null;
}

/** Colonnes de temps : saisies en heures dans les filtres, comparées en minutes */
export function isDurationColumn(column: ColumnKey): boolean {
	return (
		column === "trackedPlayTime" ||
		column === "estimatedPlayTime" ||
		column === "totalPlayTime"
	);
}

/** Ce qu'affiche une ligne dans une colonne, pour le tri et les filtres ; `null` quand la case est vide */
function getColumnValue(
	column: ColumnKey,
	row: GameRow,
): string | number | boolean | null {
	switch (column) {
		case "name":
			return row.frenchName ?? row.name;
		case "series":
			return row.series?.name ?? null;
		case "seriesNumber":
			return row.seriesNumber;
		case "developer":
			return row.developer?.name ?? null;
		case "publisher":
			return row.publisher?.name ?? null;
		case "releaseDate":
			return row.releaseDate;
		case "endingType":
			return row.endingType;
		case "platform":
			return row.platform?.shortName ?? null;
		case "status":
			return row.status;
		case "upNext":
			return row.isUpNext;
		case "owned":
			return row.isOwned;
		case "finishDate":
			return row.finishDate;
		case "finishCount":
			return row.sureFinishCount;
		case "dlc":
			return row.dlcCount === 0 ? null : row.doneDlcCount;
		case "trackedPlayTime":
			return row.trackedPlayTimeMinutes;
		case "estimatedPlayTime":
			return row.estimatedPlayTimeMinutes;
		case "totalPlayTime":
			return row.totalPlayTimeMinutes;
		case "rating":
			return row.rating;
		case "comment":
			return row.comment;
		default:
			return null;
	}
}

/** Valeur de tri : statuts et types de fin dans leur ordre de définition, cases à cocher en 0 ou 1 */
function getSortValue(column: ColumnKey, row: GameRow): string | number | null {
	if (column === "status") {
		return row.status === null
			? null
			: statusDefinitions.findIndex(({ key }) => key === row.status);
	}
	if (column === "endingType") {
		return endingTypeDefinitions.findIndex(({ key }) => key === row.endingType);
	}
	const value = getColumnValue(column, row);
	return typeof value === "boolean" ? Number(value) : value;
}

function compareSortValues(
	first: string | number,
	second: string | number,
): number {
	if (typeof first === "string" && typeof second === "string") {
		return first.localeCompare(second, "fr", {
			sensitivity: "base",
			numeric: true,
		});
	}
	return Number(first) - Number(second);
}

/** Tri multi-colonnes : les lignes des jeux sur ce qu'elles affichent, les cases vides en dernier quel que soit le sens */
export function sortGameRows(
	rows: GameRow[],
	sort: SortCriterion[],
): GameRow[] {
	function compareRows(first: GameRow, second: GameRow): number {
		for (const { column, direction } of sort) {
			const firstValue = getSortValue(column, first);
			const secondValue = getSortValue(column, second);
			if (firstValue === null && secondValue !== null) {
				return 1;
			}
			if (firstValue !== null && secondValue === null) {
				return -1;
			}
			if (firstValue !== null && secondValue !== null) {
				const order = compareSortValues(firstValue, secondValue);
				if (order !== 0) {
					return direction === "asc" ? order : -order;
				}
			}
		}
		return 0;
	}
	return sort.length === 0 ? rows : rows.toSorted(compareRows);
}

/** Une sous-ligne vue comme une ligne du jeu : les données du jeu, et celles de la version jouée à la place des agrégats */
function toCandidateRow(
	gameRow: GameRow,
	userVersionRow: UserVersionRow,
): GameRow {
	return {
		...gameRow,
		versionTitle: userVersionRow.versionTitle,
		releaseDate: userVersionRow.releaseDate,
		isCancelled: false,
		platform: userVersionRow.platform,
		status: userVersionRow.status,
		isOwned: userVersionRow.isOwned,
		isUpNext: userVersionRow.isUpNext,
		finishDate: userVersionRow.finishDate,
		sureFinishCount: userVersionRow.sureFinishCount,
		probableFinishCount: userVersionRow.probableFinishCount,
		doneDlcCount: userVersionRow.doneDlcCount,
		dlcCount: userVersionRow.dlcCount,
		trackedPlayTimeMinutes: userVersionRow.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: userVersionRow.estimatedPlayTimeMinutes,
		totalPlayTimeMinutes: userVersionRow.totalPlayTimeMinutes,
		rating: userVersionRow.rating,
		comment: userVersionRow.comment,
	};
}

/** Textes cherchés par un filtre « contient » : le nom VF, VO et le titre de version pour la colonne Nom */
function getColumnTexts(column: ColumnKey, row: GameRow): string[] {
	const texts =
		column === "name"
			? [row.frenchName, row.name, row.versionTitle]
			: [getColumnValue(column, row)];
	return texts.filter((text) => typeof text === "string");
}

function matchesFilter(row: GameRow, filter: ColumnFilter): boolean {
	switch (filter.kind) {
		case "text": {
			const searched = normalizeText(filter.text);
			const texts = getColumnTexts(filter.column, row).map(normalizeText);
			return filter.isExact
				? texts.includes(searched)
				: texts.some((text) => text.includes(searched));
		}
		case "value":
			return getColumnValue(filter.column, row) === filter.value;
		case "boolean":
			return getColumnValue(filter.column, row) === filter.value;
		case "numberRange": {
			const value = getColumnValue(filter.column, row);
			return (
				typeof value === "number" &&
				(filter.min === null || value >= filter.min) &&
				(filter.max === null || value <= filter.max)
			);
		}
		// dateRange
		default: {
			const value = getColumnValue(filter.column, row);
			return (
				typeof value === "string" &&
				(filter.from === null || value >= filter.from) &&
				(filter.to === null || value <= filter.to)
			);
		}
	}
}

/** Un jeu reste affiché si sa ligne, ou au moins une de ses versions jouées, correspond à tous les filtres */
export function filterGameRows(
	rows: GameRow[],
	filters: ColumnFilter[],
): GameRow[] {
	if (filters.length === 0) {
		return rows;
	}
	return rows.filter((row) =>
		[
			row,
			...row.userVersionRows.map((userVersionRow) =>
				toCandidateRow(row, userVersionRow),
			),
		].some((candidate) =>
			filters.every((filter) => matchesFilter(candidate, filter)),
		),
	);
}

/** Choix des filtres « liste » : types de fin, statuts, plateformes des versions jouées du backlog */
export function getFilterOptions(
	column: ColumnKey,
	database: Database,
): { value: string; label: string }[] {
	if (column === "endingType") {
		return endingTypeDefinitions.map(({ key, label }) => ({
			value: key,
			label,
		}));
	}
	if (column === "status") {
		return statusDefinitions.map(({ key, label }) => ({
			value: key,
			label,
		}));
	}
	if (column === "platform") {
		const names = new Set(
			database.userVersions.flatMap(
				({ platformId }) =>
					findById(database.platforms, platformId)?.shortName ?? [],
			),
		);
		return [...names]
			.toSorted((first, second) => first.localeCompare(second, "fr"))
			.map((name) => ({ value: name, label: name }));
	}
	return [];
}

/** Clic sur un en-tête : ⬆️, puis ⬇️, puis plus de tri sur cette colonne ; une nouvelle colonne passe après les autres */
export function toggleSort(
	sort: SortCriterion[],
	column: ColumnKey,
): SortCriterion[] {
	const current = sort.find((criterion) => criterion.column === column);
	if (current === undefined) {
		return [...sort, { column, direction: "asc" }];
	}
	if (current.direction === "asc") {
		return sort.map((criterion) =>
			criterion.column === column ? { column, direction: "desc" } : criterion,
		);
	}
	return sort.filter((criterion) => criterion.column !== column);
}

/** Remplace le filtre d'une colonne, à sa place ; `null` le retire */
export function setColumnFilter(
	filters: ColumnFilter[],
	column: ColumnKey,
	filter: ColumnFilter | null,
): ColumnFilter[] {
	if (filter === null) {
		return filters.filter((current) => current.column !== column);
	}
	return filters.some((current) => current.column === column)
		? filters.map((current) => (current.column === column ? filter : current))
		: [...filters, filter];
}

/** Une colonne masquée sort du tri et des filtres */
export function keepVisibleColumns<T extends { column: ColumnKey }>(
	items: T[],
	columns: ColumnSetting[],
): T[] {
	return items.filter(({ column }) =>
		columns.some((setting) => setting.key === column && setting.isVisible),
	);
}

export function toggleColumnVisibility(
	columns: ColumnSetting[],
	key: ColumnKey,
): ColumnSetting[] {
	// La colonne Actions reste visible : sans elle, plus de menu
	if (key === "actions") {
		return columns;
	}
	return columns.map((setting) =>
		setting.key === key
			? { ...setting, isVisible: !setting.isVisible }
			: setting,
	);
}

export function moveColumn(
	columns: ColumnSetting[],
	key: ColumnKey,
	offset: -1 | 1,
): ColumnSetting[] {
	const index = columns.findIndex((setting) => setting.key === key);
	const target = index + offset;
	if (index === -1 || target < 0 || target >= columns.length) {
		return columns;
	}
	const moved = [...columns];
	[moved[index], moved[target]] = [moved[target], moved[index]];
	return moved;
}

const columnsStorageKey = "backlog.columns";

/** Disposition des colonnes sauvegardée dans le navigateur ; `null` si absente ou illisible. Une colonne inconnue est ignorée, une nouvelle s'ajoute à la fin */
export function loadSavedColumns(): ColumnSetting[] | null {
	try {
		const saved: unknown = JSON.parse(
			window.localStorage.getItem(columnsStorageKey) ?? "null",
		);
		if (!Array.isArray(saved)) {
			return null;
		}
		const items: unknown[] = saved;
		const columns: ColumnSetting[] = [];
		for (const item of items) {
			if (
				typeof item === "object" &&
				item !== null &&
				"key" in item &&
				"isVisible" in item &&
				typeof item.isVisible === "boolean"
			) {
				const definition = columnDefinitions.find(
					({ key }) => key === item.key,
				);
				if (
					definition !== undefined &&
					!columns.some(({ key }) => key === definition.key)
				) {
					columns.push({
						key: definition.key,
						isVisible: definition.key === "actions" || item.isVisible,
					});
				}
			}
		}
		for (const { key } of columnDefinitions) {
			if (!columns.some((setting) => setting.key === key)) {
				columns.push({ key, isVisible: true });
			}
		}
		return columns;
	} catch {
		return null;
	}
}

export function saveColumns(columns: ColumnSetting[]): void {
	try {
		window.localStorage.setItem(columnsStorageKey, JSON.stringify(columns));
	} catch {
		// Stockage indisponible (navigation privée…) : la disposition ne sera pas gardée
	}
}

function formatFilterParam(filter: ColumnFilter): string {
	switch (filter.kind) {
		case "text":
			return filter.isExact ? `=${filter.text}` : filter.text;
		case "value":
			return filter.value;
		case "boolean":
			return filter.value ? "oui" : "non";
		case "numberRange":
			return `${filter.min ?? ""}..${filter.max ?? ""}`;
		// dateRange
		default:
			return `${filter.from ?? ""}..${filter.to ?? ""}`;
	}
}

function parseNumber(text: string): number | null {
	if (text.trim() === "") {
		return null;
	}
	const number = Number(text);
	return Number.isFinite(number) ? number : null;
}

function parseFilterParam(
	column: ColumnKey,
	text: string,
): ColumnFilter | null {
	const [rangeStart = "", rangeEnd = ""] = text.split("..");
	switch (columnFilterKinds[column]) {
		case "text": {
			const isExact = text.startsWith("=");
			const searched = isExact ? text.slice(1) : text;
			return searched === ""
				? null
				: { column, kind: "text", text: searched, isExact };
		}
		case "value":
			return text === "" ? null : { column, kind: "value", value: text };
		case "boolean":
			return text === "oui" || text === "non"
				? { column, kind: "boolean", value: text === "oui" }
				: null;
		case "numberRange": {
			const min = parseNumber(rangeStart);
			const max = parseNumber(rangeEnd);
			return min === null && max === null
				? null
				: { column, kind: "numberRange", min, max };
		}
		case "dateRange": {
			const from = parseIsoDate(rangeStart);
			const to = parseIsoDate(rangeEnd);
			return from === null && to === null
				? null
				: { column, kind: "dateRange", from, to };
		}
		default:
			return null;
	}
}

/** Tri et filtres dans l'URL, ex. `?sort=releaseDate:desc,name:asc&series==The+Witcher&rating=10..18` ; `sort` y est toujours, même vide */
export function buildViewSearch(
	sort: SortCriterion[],
	filters: ColumnFilter[],
): string {
	const params = new URLSearchParams();
	params.set(
		"sort",
		sort.map(({ column, direction }) => `${column}:${direction}`).join(","),
	);
	for (const filter of filters) {
		params.set(filter.column, formatFilterParam(filter));
	}
	return params.toString();
}

/** Tri et filtres lus dans l'URL ; `null` si elle n'en porte pas (pas de `sort`) : `initialState` s'applique alors */
export function readViewFromUrl(
	search: string,
): { sort: SortCriterion[]; filters: ColumnFilter[] } | null {
	const params = new URLSearchParams(search);
	const sortParam = params.get("sort");
	if (sortParam === null) {
		return null;
	}
	const sort = sortParam.split(",").flatMap((part): SortCriterion[] => {
		const [columnName, direction] = part.split(":");
		const definition = columnDefinitions.find(({ key }) => key === columnName);
		return definition !== undefined &&
			isSortableColumn(definition.key) &&
			(direction === "asc" || direction === "desc")
			? [{ column: definition.key, direction }]
			: [];
	});
	const filters = columnDefinitions.flatMap(({ key }) => {
		const text = params.get(key);
		const filter = text === null ? null : parseFilterParam(key, text);
		return filter === null ? [] : [filter];
	});
	return { sort, filters };
}

function describeRange(min: string | null, max: string | null): string {
	if (min !== null && max !== null) {
		return `entre ${min} et ${max}`;
	}
	return min === null ? `≤ ${max ?? ""}` : `≥ ${min}`;
}

function describeFilterValue(filter: ColumnFilter): string {
	switch (filter.kind) {
		case "text":
			return filter.isExact
				? `= « ${filter.text} »`
				: `contient « ${filter.text} »`;
		case "value": {
			const label =
				[...statusDefinitions, ...endingTypeDefinitions].find(
					({ key }) => key === filter.value,
				)?.label ?? filter.value;
			return `= ${label}`;
		}
		case "boolean":
			return filter.value ? "= oui" : "= non";
		case "numberRange": {
			function format(value: number | null): string | null {
				if (value === null) {
					return null;
				}
				return isDurationColumn(filter.column)
					? formatDuration(value)
					: String(value);
			}
			return describeRange(format(filter.min), format(filter.max));
		}
		// dateRange
		default:
			return describeRange(
				filter.from === null ? null : formatIsoDate(filter.from),
				filter.to === null ? null : formatIsoDate(filter.to),
			);
	}
}

// ---------- Annuler / rétablir (section 10) ----------

/** Actions gardées dans l'historique : la 21e efface la plus ancienne */
export const undoHistoryLimit = 20;

/** Ajoute un état de la base à un historique borné aux 20 dernières actions */
export function pushToHistory(
	history: Database[],
	database: Database,
): Database[] {
	return [...history, database].slice(-undoHistoryLimit);
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
			.map(
				(filter) =>
					`${getColumnLabel(filter.column)} ${describeFilterValue(filter)}`,
			)
			.join(", ") || "aucun"
	);
}
