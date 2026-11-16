import type { JellyfinItem } from "../client/jellyfinItem.type.ts";

// Les pistes d'un type (Video, Audio, Subtitle) que Jellyfin a lues dans le fichier
export function streamsOf(item: JellyfinItem | null, type: string) {
	return (item?.MediaSources?.at(0)?.MediaStreams ?? []).filter(
		(stream) => stream.Type === type,
	);
}
