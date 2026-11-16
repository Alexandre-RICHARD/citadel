import type { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";

import type { ArrMediaInfo } from "../client/arrMediaInfo.type.ts";
import type { JellyfinItem } from "../client/jellyfinItem.type.ts";
import { parseResolution } from "./parseResolution.ts";
import { qualityOfResolution } from "./qualityOfResolution.ts";
import { streamsOf } from "./streamsOf.ts";

// La qualité d'après Radarr ou Sonarr, sinon d'après la piste vidéo que Jellyfin a lue
export function describeQuality(
	mediaInfo: ArrMediaInfo | null,
	jellyfinItem: JellyfinItem | null,
): NasQualityEnum | null {
	const resolution = parseResolution(mediaInfo?.resolution);
	if (resolution !== null)
		return qualityOfResolution(resolution.width, resolution.height);
	const video = streamsOf(jellyfinItem, "Video").at(0);
	if (typeof video?.Width !== "number" || typeof video.Height !== "number")
		return null;
	return qualityOfResolution(video.Width, video.Height);
}
