import { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum.ts";
import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { computeGbPerHour } from "@citadel/specs/src/projects/backlog/helper/nas/computeGbPerHour.ts";
import { getBestSharing } from "@citadel/specs/src/projects/backlog/helper/nas/getBestSharing.ts";

import type { NasDetailsBean } from "./nasDetailsBean.type.ts";

const STORAGE_ORDER = Object.values(NasStorageEnum);
const QUALITY_ORDER = Object.values(NasQualityEnum);

function lowest<Value>(values: Value[], order: Value[]): Value | null {
	return values.reduce<Value | null>(
		(low, value) =>
			low === null || order.indexOf(value) < order.indexOf(low) ? value : low,
		null,
	);
}

function sumOrNull(values: (number | null)[]): number | null {
	const known = values.filter((value) => value !== null);
	return known.length === 0
		? null
		: known.reduce((total, value) => total + value, 0);
}

function uniqueBy<Item>(items: Item[], key: (item: Item) => string): Item[] {
	return [...new Map(items.map((item) => [key(item), item])).values()];
}

/**
 * Les colonnes du NAS d'une saison ou d'une série, sur ses épisodes principaux déjà diffusés (§4) : stockage et qualité
 * les moins bons, partage le meilleur, tailles additionnées, étiquettes et cases vérifiées comptées. Un torrent de
 * saison complète, relié à chaque épisode, n'apparaît qu'une fois. Sans épisode diffusé : rien sur le NAS
 */
export function aggregateNas(
	episodes: NasDetailsBean[],
	{
		jellyfinItemId,
		jellyfinCollection,
	}: Pick<NasDetailsBean, "jellyfinItemId" | "jellyfinCollection">,
): NasDetailsBean {
	const withFile = episodes.filter(({ fileCount }) => fileCount > 0);
	const sizeBytes = sumOrNull(episodes.map((episode) => episode.sizeBytes));
	const timed = withFile.filter(
		({ sizeBytes: size, fileMinutes }) => size !== null && fileMinutes !== null,
	);
	return {
		storage:
			lowest(
				episodes.map(({ storage }) => storage),
				STORAGE_ORDER,
			) ?? NasStorageEnum.NOT_TRACKED,
		episodeCount: episodes.length,
		fileCount: withFile.length,
		jellyfinItemId,
		jellyfinCollection,
		sharing: getBestSharing(episodes.map(({ sharing }) => sharing)),
		torrents: uniqueBy(
			episodes.flatMap(({ torrents }) => torrents),
			({ name, trackerName }) => `${name}|${trackerName ?? ""}`,
		),
		quality: lowest(
			withFile.flatMap(({ quality }) => (quality === null ? [] : [quality])),
			QUALITY_ORDER,
		),
		languageTags: Object.values(LanguageTagEnum).flatMap((tag) => {
			const count = episodes.filter(({ languageTags }) =>
				languageTags.some((languageTag) => languageTag.tag === tag),
			).length;
			return count === 0 ? [] : [{ tag, count }];
		}),
		sizeBytes,
		gbPerHour: computeGbPerHour(
			sumOrNull(timed.map((episode) => episode.sizeBytes)),
			sumOrNull(timed.map((episode) => episode.fileMinutes)),
		),
		fileMinutes: sumOrNull(episodes.map(({ fileMinutes }) => fileMinutes)),
		isRuntimeMismatch: false,
		gaps: uniqueBy(
			episodes.flatMap(({ gaps }) => gaps),
			(gap) => JSON.stringify(gap),
		),
		verifiedCount: episodes.reduce(
			(total, { verifiedCount }) => total + verifiedCount,
			0,
		),
		verifiableCount: episodes.reduce(
			(total, { verifiableCount }) => total + verifiableCount,
			0,
		),
	};
}
