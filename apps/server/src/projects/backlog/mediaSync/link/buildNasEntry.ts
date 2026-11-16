import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";
import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";
import type { NasGap } from "@citadel/specs/src/projects/backlog/mediaState/nasGap.type.ts";

import type { JellyfinItem } from "../client/jellyfinItem.type.ts";
import { describeNasFile } from "../file/describeNasFile.ts";
import { describeStorage } from "./describeStorage.ts";
import type { LinkContext } from "./linkContext.type.ts";
import type { MediaDraft } from "./mediaDraft.type.ts";
import { toNasTorrent } from "./toNasTorrent.ts";

/**
 * Ce que le relevé dit d'un film ou d'un épisode. Écarts que le job voit seul : doublon (plusieurs fichiers distincts)
 * et hors Radarr ou Sonarr (un fichier qu'aucun outil ne suit). Rend aussi l'élément Jellyfin du fichier principal
 */
export function buildNasEntry(
	context: LinkContext,
	draft: MediaDraft,
): { entry: NasEntry; jellyfinItem: JellyfinItem | null } {
	const { mainFile, trackedBy } = draft;
	const jellyfinItem =
		mainFile === null
			? null
			: (context.jellyfin.byInode.get(mainFile.inode) ?? null);
	const fileCount = draft.files.length;
	const gaps: NasGap[] = [];
	if (fileCount > 1) gaps.push({ kind: NasGapKindEnum.DUPLICATE, fileCount });
	if (mainFile !== null && trackedBy === null)
		gaps.push({ kind: NasGapKindEnum.UNTRACKED });
	return {
		jellyfinItem,
		entry: {
			storage: describeStorage(context, {
				isInJellyfin: jellyfinItem !== null,
				hasFile: mainFile !== null,
				downloadHash: draft.downloadHash,
				isTracked: trackedBy !== null,
			}),
			trackedBy,
			file:
				mainFile === null
					? null
					: describeNasFile(mainFile, draft.mediaInfo, jellyfinItem),
			fileCount,
			jellyfinItemId: jellyfinItem?.Id ?? null,
			torrents:
				mainFile === null
					? []
					: (context.torrentsByInode.get(mainFile.inode) ?? []).map(
							toNasTorrent,
						),
			gaps,
		},
	};
}
