import type { IgdbGameData } from "../../../projects/backlog/igdb/type/igdbGameData.type.ts";
import type { IgdbPlatform } from "../../../projects/backlog/igdb/type/igdbPlatform.type.ts";

const SECOND_MS = 1000;

type IgdbVersionSpec = {
	id: number;
	name?: string;
	versionTitle?: string;
	typeName?: string;
	platforms: IgdbPlatform[];
	releaseDate?: string;
};

type IgdbGameSpec = {
	// L'original, qui est aussi la première version
	id: number;
	name: string;
	frenchName?: string;
	releaseDate?: string;
	platforms: IgdbPlatform[];
	otherVersions?: IgdbVersionSpec[];
	dlcs?: { id: number; name: string }[];
	collection?: { id: number; name: string };
	developer?: { id: number; name: string };
	gameStatus?: string;
};

function toSeconds(isoDate: string): number {
	return Date.parse(`${isoDate}T00:00:00.000Z`) / SECOND_MS;
}

function buildReleaseDates(
	platforms: IgdbPlatform[],
	releaseDate: string | undefined,
): { date?: number; platform?: number }[] {
	return releaseDate === undefined
		? []
		: platforms.map(({ id }) => ({
				date: toSeconds(releaseDate),
				platform: id,
			}));
}

// Ce que igdbGateway.fetchGameData rendrait pour ce jeu : les tests la remplacent par ces données
export function buildIgdbGameData(spec: IgdbGameSpec): IgdbGameData {
	return {
		original: {
			id: spec.id,
			name: spec.name,
			...(spec.frenchName !== undefined && {
				alternative_names: [
					{ id: spec.id, name: spec.frenchName, comment: "French title" },
				],
			}),
			...(spec.releaseDate !== undefined && {
				first_release_date: toSeconds(spec.releaseDate),
			}),
			artworks: [{ image_id: `ar${spec.id}` }],
			...(spec.collection !== undefined && {
				collections: [{ ...spec.collection, as_child_relations: [] }],
			}),
			...(spec.developer !== undefined && {
				involved_companies: [
					{ developer: true, publisher: true, company: spec.developer },
				],
			}),
		},
		versions: [
			{
				id: spec.id,
				name: spec.name,
				game_type: { type: "Main Game" },
				cover: { image_id: `co${spec.id}` },
				url: `https://www.igdb.com/games/${spec.id}`,
				platforms: spec.platforms,
				release_dates: buildReleaseDates(spec.platforms, spec.releaseDate),
				dlcs: (spec.dlcs ?? []).map(({ id }) => id),
			},
			...(spec.otherVersions ?? []).map((version) => ({
				id: version.id,
				name: version.name ?? spec.name,
				...(version.versionTitle !== undefined && {
					version_title: version.versionTitle,
				}),
				game_type: { type: version.typeName ?? "Main Game" },
				url: `https://www.igdb.com/games/${version.id}`,
				platforms: version.platforms,
				release_dates: buildReleaseDates(
					version.platforms,
					version.releaseDate,
				),
			})),
		],
		dlcs: (spec.dlcs ?? []).map(({ id, name }) => ({ id, name })),
		gameStatus: spec.gameStatus ?? null,
		skippedEntries: [],
	};
}
