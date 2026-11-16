import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";

import type { LinkContext } from "./linkContext.type.ts";

/**
 * Où est le fichier (§5) : il dit où est le fichier, pas qui le suit. En téléchargement : son torrent, dans la file de
 * Radarr ou de Sonarr, n'est pas fini
 */
export function describeStorage(
	context: Pick<LinkContext, "torrentsByHash">,
	{
		isInJellyfin,
		hasFile,
		downloadHash,
		isTracked,
	}: {
		isInJellyfin: boolean;
		hasFile: boolean;
		downloadHash: string | null;
		isTracked: boolean;
	},
): NasStorageEnum {
	if (isInJellyfin) return NasStorageEnum.IN_JELLYFIN;
	if (hasFile) return NasStorageEnum.PRESENT;
	const download =
		downloadHash === null
			? undefined
			: context.torrentsByHash.get(downloadHash);
	if (download !== undefined && download.progress < 1)
		return NasStorageEnum.DOWNLOADING;
	return isTracked ? NasStorageEnum.EXPECTED : NasStorageEnum.NOT_TRACKED;
}
