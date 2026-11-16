import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { computeGbPerHour } from "@citadel/specs/src/projects/backlog/helper/nas/computeGbPerHour.ts";
import { describeLanguageTags } from "@citadel/specs/src/projects/backlog/helper/nas/describeLanguageTags.ts";
import { getBestSharing } from "@citadel/specs/src/projects/backlog/helper/nas/getBestSharing.ts";
import { isRuntimeMismatch } from "@citadel/specs/src/projects/backlog/helper/nas/isRuntimeMismatch.ts";
import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";

import { isVerifiableEntry } from "./isVerifiableEntry.ts";
import type { NasDetailsBean } from "./nasDetailsBean.type.ts";

type FileContext = {
	// null : le relevé ne connaît pas ce film ou cet épisode
	entry: NasEntry | null;
	isVerified: boolean;
	tmdbMinutes: number | null;
	originalLanguage: string | null;
	jellyfinCollection: string | null;
};

// Rien sur le NAS : ni fichier, ni outil
const NOTHING: NasDetailsBean = {
	storage: NasStorageEnum.NOT_TRACKED,
	episodeCount: null,
	fileCount: 0,
	jellyfinItemId: null,
	jellyfinCollection: null,
	sharing: NasSharingEnum.NONE,
	torrents: [],
	quality: null,
	languageTags: [],
	sizeBytes: null,
	gbPerHour: null,
	fileMinutes: null,
	isRuntimeMismatch: false,
	gaps: [],
	verifiedCount: 0,
	verifiableCount: 0,
};

/**
 * Les colonnes du NAS d'un film ou d'un épisode, d'après le relevé. Un fichier vérifié n'est plus en alerte de durée
 * (§5) ; les écarts, eux, restent tant qu'ils sont vrais
 */
export function describeFileNas({
	entry,
	isVerified,
	tmdbMinutes,
	originalLanguage,
	jellyfinCollection,
}: FileContext): NasDetailsBean {
	if (entry === null) return { ...NOTHING, jellyfinCollection };
	const { file } = entry;
	const isVerifiable = isVerifiableEntry(entry);
	const isCountedVerified = isVerifiable && isVerified;
	const fileMinutes = file?.durationMinutes ?? null;
	return {
		storage: entry.storage,
		episodeCount: null,
		fileCount: file === null ? 0 : 1,
		jellyfinItemId: entry.jellyfinItemId,
		jellyfinCollection,
		sharing: getBestSharing(entry.torrents.map(({ sharing }) => sharing)),
		torrents: entry.torrents.map(({ name, trackerName, sharing }) => ({
			name,
			trackerName,
			sharing,
		})),
		quality: file?.quality ?? null,
		languageTags:
			file === null
				? []
				: describeLanguageTags(file, originalLanguage).map((tag) => ({
						tag,
						count: 1,
					})),
		sizeBytes: file?.sizeBytes ?? null,
		gbPerHour: computeGbPerHour(file?.sizeBytes ?? null, fileMinutes),
		fileMinutes,
		isRuntimeMismatch:
			!isCountedVerified && isRuntimeMismatch(fileMinutes, tmdbMinutes),
		gaps: entry.gaps,
		verifiedCount: isCountedVerified ? 1 : 0,
		verifiableCount: isVerifiable ? 1 : 0,
	};
}
