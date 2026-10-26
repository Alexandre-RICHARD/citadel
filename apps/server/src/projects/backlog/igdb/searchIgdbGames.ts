import { getGameTypeName } from "./getGameTypeName.ts";
import { getIgdbReference } from "./getIgdbReference.ts";
import { getOriginalParentId } from "./getOriginalParentId.ts";
import { igdbClient } from "./igdbClient.ts";
import { IgdbGameTypeNameEnum } from "./igdbGameTypeName.enum.ts";
import type { IgdbReference } from "./type/igdbReference.type.ts";
import type { IgdbSearchGame } from "./type/igdbSearchGame.type.ts";
import type { IgdbSearchHit } from "./type/igdbSearchHit.type.ts";

// Types jamais proposés par la recherche
const EXCLUDED_GAME_TYPES: string[] = [
	IgdbGameTypeNameEnum.MOD,
	IgdbGameTypeNameEnum.FORK,
];

// Types qu'un résultat peut avoir : un jeu de base, ou une version dont l'original est introuvable
const RESULT_GAME_TYPES: string[] = [
	IgdbGameTypeNameEnum.MAIN_GAME,
	IgdbGameTypeNameEnum.STANDALONE_EXPANSION,
	IgdbGameTypeNameEnum.REMAKE,
	IgdbGameTypeNameEnum.REMASTER,
	IgdbGameTypeNameEnum.EXPANDED_GAME,
	IgdbGameTypeNameEnum.PORT,
];

// Contenus additionnels rattachés à leur jeu par `parent_game` : la recherche mène à ce jeu
const ADD_ON_GAME_TYPES: string[] = [
	IgdbGameTypeNameEnum.DLC,
	IgdbGameTypeNameEnum.EXPANSION,
	IgdbGameTypeNameEnum.PACK,
	IgdbGameTypeNameEnum.UPDATE,
	IgdbGameTypeNameEnum.EPISODE,
	IgdbGameTypeNameEnum.SEASON,
];

const SEARCH_GAME_FIELDS =
	"fields name, game_type, version_parent, parent_game, bundles, first_release_date, cover.image_id, alternative_names.name, alternative_names.comment, platforms.name, platforms.abbreviation;";

// Fiches lues sur IGDB ; elles sont regroupées par jeu, d'où plus que les 20 résultats rendus
const SEARCH_FETCH_LIMIT = 50;
const SEARCH_RESULT_LIMIT = 20;
const RELATED_FETCH_LIMIT = 500;

// Fiche qui rapproche une fiche trouvée de son jeu : l'original d'une version, le jeu d'un contenu additionnel
function getSearchParentId(
	reference: IgdbReference,
	game: IgdbSearchGame,
): number | undefined {
	return (
		getOriginalParentId(reference, game) ??
		(ADD_ON_GAME_TYPES.includes(getGameTypeName(reference, game.game_type))
			? game.parent_game
			: undefined)
	);
}

// Bundle qui n'est pas une édition rattachée par `version_parent` : la recherche mène aux jeux qu'il contient
function isUnattachedBundle(
	reference: IgdbReference,
	game: IgdbSearchGame,
): boolean {
	return (
		getGameTypeName(reference, game.game_type) ===
			String(IgdbGameTypeNameEnum.BUNDLE) && game.version_parent === undefined
	);
}

// Pour ranger les jeux d'un bundle : les dates inconnues en dernier
function getReleaseTime(game: IgdbSearchGame): number {
	return game.first_release_date ?? Number.MAX_SAFE_INTEGER;
}

// Apicalypse : guillemets et antislashs échappés dans la saisie
function escapeQuery(query: string): string {
	return query.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

/**
 * Lit, niveau par niveau, les fiches absentes des résultats : les parents (un portage peut descendre d'un autre portage,
 * un DLC d'une édition) et le contenu des bundles. Chaque niveau dépend du précédent
 */
async function fetchRelatedGames(
	reference: IgdbReference,
	matches: IgdbSearchGame[],
): Promise<Map<number, IgdbSearchGame>> {
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
		if (conditions.length === 0) break;

		parentIds.forEach((id) => requestedIds.add(id));
		bundleIds.forEach((id) => expandedBundleIds.add(id));
		// eslint-disable-next-line no-await-in-loop -- chaque niveau se lit sur le précédent
		level = await igdbClient.request<IgdbSearchGame[]>(
			"games",
			`${SEARCH_GAME_FIELDS} where ${conditions.join(" | ")}; limit ${RELATED_FETCH_LIMIT};`,
		);
		level.forEach((game) => gamesById.set(game.id, game));
	}
	return gamesById;
}

/**
 * Recherche IGDB. `search` ne se combine pas avec `sort` : les résultats restent dans l'ordre de
 * pertinence d'IGDB. Chaque fiche trouvée mène à son jeu de base, qui prend la place de la mieux classée
 */
export async function searchIgdbGames(query: string): Promise<IgdbSearchHit[]> {
	const reference = await getIgdbReference();
	const gameTypeIds = [...reference.gameTypes]
		.filter(([, type]) => !EXCLUDED_GAME_TYPES.includes(type))
		.map(([id]) => id);
	const matches = await igdbClient.request<IgdbSearchGame[]>(
		"games",
		[
			`search "${escapeQuery(query)}";`,
			SEARCH_GAME_FIELDS,
			`where game_type = (${gameTypeIds.join(",")});`,
			`limit ${SEARCH_FETCH_LIMIT};`,
		].join(" "),
	);
	const gamesById = await fetchRelatedGames(reference, matches);

	// Jeux de base d'une fiche : elle-même, l'original d'une version, le jeu d'un contenu additionnel, ou les jeux d'un bundle
	function findBaseGames(
		game: IgdbSearchGame,
		visitedIds: Set<number>,
	): IgdbSearchGame[] {
		if (visitedIds.has(game.id)) return [];
		visitedIds.add(game.id);

		if (isUnattachedBundle(reference, game))
			return [...gamesById.values()]
				.filter((content) => content.bundles?.includes(game.id) === true)
				.toSorted(
					(first, second) => getReleaseTime(first) - getReleaseTime(second),
				)
				.flatMap((content) => findBaseGames(content, visitedIds));

		const parent = gamesById.get(getSearchParentId(reference, game) ?? NaN);
		if (parent !== undefined) return findBaseGames(parent, visitedIds);

		// Un DLC sans jeu, un bundle vide… ne mènent à rien
		return RESULT_GAME_TYPES.includes(
			getGameTypeName(reference, game.game_type),
		)
			? [game]
			: [];
	}

	// Un jeu n'apparaît qu'une fois, à la place de sa fiche la mieux classée. Les jeux trouvés seulement via un bundle passent
	// après les autres : « Final Fantasy VII » ne doit pas proposer FF8 en deuxième, via un pack FF7 + FF8. « via » nomme la fiche
	// quand le jeu n'a pas été trouvé lui-même et qu'elle porte un autre nom (les portages de FF7 s'appellent comme lui)
	const matchedIds = new Set(matches.map(({ id }) => id));
	const hits = new Map<number, IgdbSearchHit>();
	for (const match of [
		...matches.filter((game) => !isUnattachedBundle(reference, game)),
		...matches.filter((game) => isUnattachedBundle(reference, game)),
	])
		for (const game of findBaseGames(match, new Set()))
			if (!hits.has(game.id))
				hits.set(game.id, {
					game,
					matchedName:
						matchedIds.has(game.id) ||
						match.name.toLowerCase() === game.name.toLowerCase()
							? null
							: match.name,
				});

	return [...hits.values()].slice(0, SEARCH_RESULT_LIMIT);
}
