import type { NasFile } from "@citadel/specs/src/projects/backlog/mediaState/nasFile.type.ts";

import type { ArrMediaInfo } from "../client/arrMediaInfo.type.ts";
import type { JellyfinItem } from "../client/jellyfinItem.type.ts";
import type { DiskFile } from "../disk/diskFile.type.ts";
import { describeQuality } from "./describeQuality.ts";
import { parseRunTimeMinutes } from "./parseRunTimeMinutes.ts";
import { streamsOf } from "./streamsOf.ts";
import { toLanguageCodes } from "./toLanguageCodes.ts";

// Une durée de Jellyfin (RunTimeTicks) est en dix-millionièmes de seconde
const TICKS_PER_MINUTE = 600_000_000;

function describeDuration(
	mediaInfo: ArrMediaInfo | null,
	jellyfinItem: JellyfinItem | null,
): number | null {
	const minutes =
		parseRunTimeMinutes(mediaInfo?.runTime) ??
		(typeof jellyfinItem?.RunTimeTicks === "number"
			? jellyfinItem.RunTimeTicks / TICKS_PER_MINUTE
			: null);
	return minutes === null ? null : Math.round(minutes * 10) / 10;
}

/**
 * Le fichier d'un film ou d'un épisode, pour le relevé. Qualité, durée et audio : d'après Radarr ou Sonarr, qui les
 * lisent dans le fichier, sinon d'après Jellyfin. Sous-titres : ceux du fichier, plus ceux que Bazarr pose à côté,
 * que seul Jellyfin voit
 */
export function describeNasFile(
	file: DiskFile,
	mediaInfo: ArrMediaInfo | null,
	jellyfinItem: JellyfinItem | null,
): NasFile {
	const audio =
		mediaInfo?.audioLanguages === undefined || mediaInfo.audioLanguages === null
			? streamsOf(jellyfinItem, "Audio").map(({ Language }) => Language)
			: [mediaInfo.audioLanguages];
	return {
		path: file.path,
		inode: file.inode,
		sizeBytes: file.sizeBytes,
		quality: describeQuality(mediaInfo, jellyfinItem),
		durationMinutes: describeDuration(mediaInfo, jellyfinItem),
		audioLanguages: toLanguageCodes(audio),
		subtitleLanguages: toLanguageCodes([
			mediaInfo?.subtitles,
			...streamsOf(jellyfinItem, "Subtitle").map(({ Language }) => Language),
		]),
	};
}
