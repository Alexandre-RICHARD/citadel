/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont utils.ts pour toutes les fonctions */
import {
	type AppState,
	columnDefinitions,
	type ColumnFilter,
	type ColumnKey,
	type ColumnSetting,
	type Database,
	type EndingType,
	endingTypeDefinitions,
	type Game,
	type GameChoices,
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
	type IsoDate,
	type Modal,
	type Platform,
	type SortCriterion,
	type Variant,
	type VariantDlc,
	type VariantDraft,
	type VariantRow,
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

// ---------- Base : recherche sans requête IGDB ----------

/** Jeux déjà en base dont le nom VO, le nom VF ou un titre de version contient la saisie, triés par nom affiché */
export function searchDatabaseGames(database: Database, query: string): Game[] {
	const normalizedQuery = normalizeText(query.trim());
	return database.games
		.filter((game) =>
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
					reason: `« ${candidate.name} » est rattaché comme version, mais son type est « ${typeName} » : fiche ignorée.`,
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

/** Cover et artworks du jeu, rechargés à l'ouverture de « Modifier le jeu » (section 8) : la cover d'abord */
export async function fetchIgdbGameImages(
	gameId: number,
	signal: AbortSignal,
): Promise<IgdbImageId[]> {
	const game = (
		await requestIgdb<IgdbGameImages[]>(
			"games",
			`fields cover.image_id, artworks.image_id; where id = ${gameId};`,
			signal,
		)
	).at(0);
	return [
		...(game?.cover === undefined ? [] : [game.cover.image_id]),
		...(game?.artworks ?? []).map((artwork) => artwork.image_id),
	];
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

/** Range les données IGDB dans la modale d'ajout si elle attend toujours cette fiche : cover pré-sélectionnée, seule la version originale cochée */
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
		choices: {
			...modal.choices,
			imageId: modal.choices.imageId ?? gameImport.imageIds.at(0) ?? null,
		},
		versionIds: [gameImport.game.id],
	};
}

/** Coche ou décoche une version à enregistrer ; l'originale reste cochée */
export function toggleImportedVersion(
	modal: Extract<Modal, { kind: "addGame" }>,
	versionId: number,
): Extract<Modal, { kind: "addGame" }> {
	if (versionId === modal.gameImport?.game.id) {
		return modal;
	}
	return {
		...modal,
		versionIds: modal.versionIds.includes(versionId)
			? modal.versionIds.filter((id) => id !== versionId)
			: [...modal.versionIds, versionId],
	};
}

/** Les données IGDB réduites aux versions cochées, à leurs plateformes et à leurs dates de sortie */
export function keepImportedVersions(
	gameImport: GameImport,
	versionIds: number[],
): GameImport {
	const keptIds = [gameImport.game.id, ...versionIds];
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
	};
}

/** Range les images rechargées dans la modale « Modifier le jeu » ; l'image choisie reste proposée même si IGDB ne l'a plus */
export function receiveGameImages(
	modal: Modal | null,
	gameId: number,
	imageIds: IgdbImageId[],
): Modal | null {
	if (
		modal?.kind !== "editGame" ||
		modal.gameId !== gameId ||
		modal.imageIds !== null
	) {
		return modal;
	}
	const { imageId } = modal.choices;
	return {
		...modal,
		imageIds:
			imageId === null || imageIds.includes(imageId)
				? imageIds
				: [imageId, ...imageIds],
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

// ---------- Données et statuts ----------

export function findById<T extends { id: number }>(
	items: T[],
	id: number | null,
): T | null {
	return id === null ? null : (items.find((item) => item.id === id) ?? null);
}

function getStatusRank(status: VariantStatus): number | null {
	return (
		variantStatusDefinitions.find(({ key }) => key === status)?.rank ?? null
	);
}

/** Rang 5 ou plus : la variante est finie (section 6) */
export function isFinishedStatus(status: VariantStatus): boolean {
	return (getStatusRank(status) ?? 0) >= 5;
}

/** Les statuts proposés dépendent du type de fin du jeu (section 6) */
export function isStatusAllowed(
	status: VariantStatus,
	endingType: EndingType,
): boolean {
	return variantStatusDefinitions.some((definition) => {
		const endingTypes: readonly EndingType[] = definition.endingTypes;
		return definition.key === status && endingTypes.includes(endingType);
	});
}

/** Statut devenu incompatible avec un nouveau type de fin (section 8) : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé */
export function convertStatus(
	status: VariantStatus,
	endingType: EndingType,
): VariantStatus {
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

/** Valeurs d'une nouvelle variante : Pas commencé, cases décochées, compteurs et temps à 0, le reste vide */
export const defaultVariantDraft: VariantDraft = {
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
	doneDlcIds: [],
};

/** id interne de la prochaine variante créée */
export function getNextVariantId(database: Database): number {
	return Math.max(0, ...database.variants.map(({ id }) => id)) + 1;
}

/** Au rang 5 ou plus, « fois fini (sûr) » passe à 1 s'il était à 0 (section 6) */
function countFirstFinish(variant: Variant): Variant {
	return isFinishedStatus(variant.status) && variant.sureFinishCount === 0
		? { ...variant, sureFinishCount: 1 }
		: variant;
}

/**
 * Ajoute une variante avec les données pré-remplies et ses DLC faits, sauf si la même version + plateforme existe déjà (section 5).
 * Son statut suit les règles d'un changement de statut (section 6).
 */
export function addVariant(
	database: Database,
	versionId: number,
	platformId: number,
	draft: VariantDraft,
): Database {
	if (
		database.variants.some(
			(variant) =>
				variant.versionId === versionId && variant.platformId === platformId,
		)
	) {
		return database;
	}
	const { doneDlcIds, ...data } = draft;
	const variantId = getNextVariantId(database);
	return {
		...database,
		variants: [
			...database.variants,
			countFirstFinish({ id: variantId, versionId, platformId, ...data }),
		],
		variantDlcs: [
			...database.variantDlcs,
			...doneDlcIds.map((dlcId) => ({ variantId, dlcId })),
		],
	};
}

/**
 * « Valider » de la modale d'ajout (section 8) : le jeu, les versions cochées (`keepImportedVersions`), ses DLC, sa série,
 * sa franchise et ses sociétés, sans doublon. La variante s'ajoute ensuite, à part.
 * Un jeu déjà en base garde ses choix : seules les fiches manquantes s'ajoutent.
 */
export function addGameImport(
	database: Database,
	gameImport: GameImport,
	choices: GameChoices,
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
	return {
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
}

export function updateVariant(
	database: Database,
	variantId: number,
	update: (variant: Variant) => Variant,
): Database {
	return {
		...database,
		variants: database.variants.map((variant) =>
			variant.id === variantId ? update(variant) : variant,
		),
	};
}

/** Statut d'une variante ; au rang 5 ou plus, « fois fini (sûr) » passe à 1 s'il était à 0 (section 6) */
export function setVariantStatus(
	database: Database,
	variantId: number,
	status: VariantStatus,
): Database {
	return updateVariant(database, variantId, (variant) =>
		countFirstFinish({ ...variant, status }),
	);
}

/** Coche ou décoche un DLC comme fait sur une variante */
export function toggleVariantDlc(
	database: Database,
	variantId: number,
	dlcId: number,
): Database {
	function isThisDlc(variantDlc: VariantDlc): boolean {
		return variantDlc.variantId === variantId && variantDlc.dlcId === dlcId;
	}
	return {
		...database,
		variantDlcs: database.variantDlcs.some(isThisDlc)
			? database.variantDlcs.filter((variantDlc) => !isThisDlc(variantDlc))
			: [...database.variantDlcs, { variantId, dlcId }],
	};
}

export function getGameVariantIds(
	database: Database,
	gameId: number,
): number[] {
	const versionIds = database.versions
		.filter((version) => version.gameId === gameId)
		.map(({ id }) => id);
	return database.variants
		.filter(({ versionId }) => versionIds.includes(versionId))
		.map(({ id }) => id);
}

/** Retire des variantes et leurs DLC faits ; un jeu sans variante quitte le backlog mais reste en base (section 8) */
export function removeVariants(
	database: Database,
	variantIds: number[],
): Database {
	return {
		...database,
		variants: database.variants.filter(({ id }) => !variantIds.includes(id)),
		variantDlcs: database.variantDlcs.filter(
			({ variantId }) => !variantIds.includes(variantId),
		),
	};
}

/** « Modifier le jeu » (section 8) : les trois choix, puis la conversion des statuts que le nouveau type de fin rend incompatibles */
export function updateGameChoices(
	database: Database,
	gameId: number,
	choices: GameChoices,
): Database {
	const variantIds = getGameVariantIds(database, gameId);
	return {
		...database,
		games: database.games.map((game) =>
			game.id === gameId
				? {
						...game,
						...choices,
						seriesNumber: game.seriesId === null ? null : choices.seriesNumber,
					}
				: game,
		),
		variants: database.variants.map((variant) =>
			variantIds.includes(variant.id)
				? {
						...variant,
						status: convertStatus(variant.status, choices.endingType),
					}
				: variant,
		),
	};
}

/** « Logger cette ligne » (section 9) : le jeu, ses versions et ses variantes tels qu'ils sont stockés ; une sous-ligne s'en tient à sa variante */
export function getStoredLine(
	database: Database,
	gameId: number,
	variantId: number | null,
): { game: Game | null; versions: Version[]; variants: Variant[] } {
	const versions = database.versions.filter(
		(version) => version.gameId === gameId,
	);
	const variants = database.variants.filter(
		(variant) =>
			versions.some(({ id }) => id === variant.versionId) &&
			(variantId === null || variant.id === variantId),
	);
	return {
		game: findById(database.games, gameId),
		versions:
			variantId === null
				? versions
				: versions.filter(({ id }) =>
						variants.some((variant) => variant.versionId === id),
					),
		variants,
	};
}

// ---------- Tableau : agrégats et affichage (sections 6, 7 et 9) ----------

/** Défilement infini : nombre de jeux par page */
export const backlogPageSize = 25;

/** Mode édition : retour automatique en lecture seule après 1 minute d'inactivité (section 9) */
export const editModeIdleMs = 60_000;

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

// ---------- Tri, filtres et colonnes (section 9) ----------

/** Sorte de filtre de chaque colonne ; la miniature et les actions n'ont ni filtre ni tri */
export const columnFilterKinds: Record<ColumnKey, ColumnFilter["kind"] | null> =
	{
		thumbnail: null,
		name: "text",
		series: "text",
		seriesNumber: "numberRange",
		franchise: "text",
		developer: "text",
		publisher: "text",
		releaseDate: "dateRange",
		endingType: "value",
		platform: "value",
		status: "value",
		playSoon: "boolean",
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
		case "franchise":
			return row.franchise?.name ?? null;
		case "developer":
			return row.developer?.name ?? null;
		case "publisher":
			return row.publisher?.name ?? null;
		case "releaseDate":
			return row.releaseDate;
		case "endingType":
			return row.endingType;
		case "platform":
			return row.platform?.name ?? null;
		case "status":
			return row.status;
		case "playSoon":
			return row.playSoon;
		case "owned":
			return row.owned;
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
			: variantStatusDefinitions.findIndex(({ key }) => key === row.status);
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

/** Une sous-ligne vue comme une ligne du jeu : les données du jeu, et celles de la variante à la place des agrégats */
function toCandidateRow(gameRow: GameRow, variantRow: VariantRow): GameRow {
	return {
		...gameRow,
		versionTitle: variantRow.versionTitle,
		releaseDate: variantRow.releaseDate,
		isCancelled: false,
		platform: variantRow.platform,
		status: variantRow.status,
		owned: variantRow.owned,
		playSoon: variantRow.playSoon,
		finishDate: variantRow.finishDate,
		sureFinishCount: variantRow.sureFinishCount,
		probableFinishCount: variantRow.probableFinishCount,
		doneDlcCount: variantRow.doneDlcCount,
		dlcCount: variantRow.dlcCount,
		trackedPlayTimeMinutes: variantRow.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: variantRow.estimatedPlayTimeMinutes,
		totalPlayTimeMinutes: variantRow.totalPlayTimeMinutes,
		rating: variantRow.rating,
		comment: variantRow.comment,
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

/** Un jeu reste affiché si sa ligne, ou au moins une de ses variantes, correspond à tous les filtres */
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
			...row.variantRows.map((variantRow) => toCandidateRow(row, variantRow)),
		].some((candidate) =>
			filters.every((filter) => matchesFilter(candidate, filter)),
		),
	);
}

/** Choix des filtres « liste » : types de fin, statuts, plateformes des variantes du backlog */
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
		return variantStatusDefinitions.map(({ key, label }) => ({
			value: key,
			label,
		}));
	}
	if (column === "platform") {
		const names = new Set(
			database.variants.flatMap(
				({ platformId }) =>
					findById(database.platforms, platformId)?.name ?? [],
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

/** Tri et filtres dans l'URL, ex. `?sort=releaseDate:desc,name:asc&franchise==The+Witcher&rating=10..18` ; `sort` y est toujours, même vide */
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
				[...variantStatusDefinitions, ...endingTypeDefinitions].find(
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
			.map(
				(filter) =>
					`${getColumnLabel(filter.column)} ${describeFilterValue(filter)}`,
			)
			.join(", ") || "aucun"
	);
}
