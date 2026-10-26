import { getGameTypeName } from "./getGameTypeName.ts";
import { getIgdbReference } from "./getIgdbReference.ts";
import { getOriginalParentId } from "./getOriginalParentId.ts";
import { igdbClient } from "./igdbClient.ts";
import { IgdbGameTypeNameEnum } from "./igdbGameTypeName.enum.ts";
import type { IgdbDlcGame } from "./type/igdbDlcGame.type.ts";
import type { IgdbGameData } from "./type/igdbGameData.type.ts";
import type { IgdbGameNode } from "./type/igdbGameNode.type.ts";
import type { IgdbOriginalGame } from "./type/igdbOriginalGame.type.ts";
import type { IgdbReference } from "./type/igdbReference.type.ts";
import type { IgdbSkippedEntry } from "./type/igdbSkippedEntry.type.ts";
import type { IgdbVersionGame } from "./type/igdbVersionGame.type.ts";

// Types d'une version, originale comprise (cahier des charges, §5) : jeu principal ou édition, remaster, portage, version enrichie
const VERSION_GAME_TYPES: string[] = [
	IgdbGameTypeNameEnum.MAIN_GAME,
	IgdbGameTypeNameEnum.REMASTER,
	IgdbGameTypeNameEnum.PORT,
	IgdbGameTypeNameEnum.EXPANDED_GAME,
];

// Seuls les DLC et les extensions comptent, ni packs ni mises à jour (cahier des charges, §5)
const DLC_GAME_TYPES: string[] = [
	IgdbGameTypeNameEnum.DLC,
	IgdbGameTypeNameEnum.EXPANSION,
];

const NODE_FIELDS =
	"fields name, game_type, version_parent, parent_game, remasters, ports, expanded_games;";
const VERSION_FIELDS =
	"fields name, version_title, game_type.type, cover.image_id, url, platforms.name, platforms.abbreviation, platforms.slug, release_dates.date, release_dates.platform, dlcs, expansions;";
const ORIGINAL_FIELDS =
	"fields name, alternative_names.name, alternative_names.comment, first_release_date, game_status, artworks.image_id, collections.name, collections.as_child_relations.parent_collection, franchise.name, franchises.name, involved_companies.developer, involved_companies.publisher, involved_companies.company.name, involved_companies.company.logo.image_id;";
const FETCH_LIMIT = 500;

function fetchNodes(where: string): Promise<IgdbGameNode[]> {
	return igdbClient.request<IgdbGameNode[]>(
		"games",
		`${NODE_FIELDS} where ${where}; limit ${FETCH_LIMIT};`,
	);
}

// Remonte de la fiche demandée jusqu'à l'original ; null si la fiche n'existe pas
async function findOriginal(
	reference: IgdbReference,
	igdbId: number,
): Promise<IgdbGameNode | null> {
	let original = (await fetchNodes(`id = ${igdbId}`)).at(0);
	if (original === undefined) return null;

	const visitedIds = new Set([original.id]);
	let parentId = getOriginalParentId(reference, original);
	while (parentId !== undefined && !visitedIds.has(parentId)) {
		// eslint-disable-next-line no-await-in-loop -- chaque parent se lit sur la fiche précédente
		const parent = (await fetchNodes(`id = ${parentId}`)).at(0);
		if (parent === undefined) break;
		visitedIds.add(parent.id);
		original = parent;
		parentId = getOriginalParentId(reference, parent);
	}
	return original;
}

// Descend l'arbre à toute profondeur : éditions (`version_parent`), remasters, portages et versions enrichies
async function findVersionNodes(
	reference: IgdbReference,
	original: IgdbGameNode,
): Promise<{ versionIds: number[]; skippedEntries: IgdbSkippedEntry[] }> {
	const versionIds = new Set([original.id]);
	const skippedIds = new Set<number>();
	const skippedEntries: IgdbSkippedEntry[] = [];
	let level: IgdbGameNode[] = [original];
	while (level.length > 0) {
		const childIds = level.flatMap((node) => [
			...(node.remasters ?? []),
			...(node.ports ?? []),
			...(node.expanded_games ?? []),
		]);
		const conditions = [
			`version_parent = (${level.map(({ id }) => id).join(",")})`,
			...(childIds.length === 0 ? [] : [`id = (${childIds.join(",")})`]),
		];
		// eslint-disable-next-line no-await-in-loop -- chaque niveau de l'arbre se lit sur le précédent
		const candidates = await fetchNodes(conditions.join(" | "));
		level = [];
		for (const candidate of candidates) {
			const typeName = getGameTypeName(reference, candidate.game_type);
			const isNew =
				!versionIds.has(candidate.id) && !skippedIds.has(candidate.id);
			// Un bundle rattaché par `version_parent` est une édition vendue avec ses DLC : une version (§5)
			const isVersion =
				VERSION_GAME_TYPES.includes(typeName) ||
				(typeName === String(IgdbGameTypeNameEnum.BUNDLE) &&
					candidate.version_parent !== undefined);
			if (isNew && isVersion) {
				versionIds.add(candidate.id);
				level.push(candidate);
			} else if (isNew) {
				skippedIds.add(candidate.id);
				skippedEntries.push({ typeName, entry: candidate });
			}
		}
	}
	return { versionIds: [...versionIds], skippedEntries };
}

/**
 * Tout ce qu'il faut stocker pour la fiche demandée (cahier des charges, §3 et §5) : on remonte à son original, on parcourt
 * l'arbre de ses versions, puis on lit leur détail et leurs DLC. null si la fiche ou son original n'existe pas sur IGDB
 */
export async function fetchIgdbGameData(
	igdbId: number,
): Promise<IgdbGameData | null> {
	const reference = await getIgdbReference();
	const original = await findOriginal(reference, igdbId);
	if (original === null) return null;

	const { versionIds, skippedEntries } = await findVersionNodes(
		reference,
		original,
	);
	const versions = await igdbClient.request<IgdbVersionGame[]>(
		"games",
		`${VERSION_FIELDS} where id = (${versionIds.join(",")}); limit ${FETCH_LIMIT};`,
	);
	const originalGame = (
		await igdbClient.request<IgdbOriginalGame[]>(
			"games",
			`${ORIGINAL_FIELDS} where id = ${original.id};`,
		)
	).at(0);
	if (originalGame === undefined) return null;

	// DLC et extensions de l'original et de toutes ses versions, sans doublon
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
			: await igdbClient.request<IgdbDlcGame[]>(
					"games",
					`fields name, game_type; where id = (${dlcIds.join(",")}); limit ${FETCH_LIMIT};`,
				);

	return {
		original: originalGame,
		versions,
		dlcs: dlcCandidates
			.filter((dlc) =>
				DLC_GAME_TYPES.includes(getGameTypeName(reference, dlc.game_type)),
			)
			.toSorted((first, second) => first.id - second.id),
		gameStatus:
			originalGame.game_status === undefined
				? null
				: (reference.gameStatuses.get(originalGame.game_status) ?? null),
		skippedEntries,
	};
}
