import type { ReportDuplicate } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportDuplicate.type.ts";

import type { DiskFile } from "../disk/diskFile.type.ts";
import { describeQuality } from "../file/describeQuality.ts";
import type { LinkContext } from "./linkContext.type.ts";

// Un doublon pour le rapport : chaque fichier avec sa qualité (lue par Jellyfin), sa taille et ses torrents
export function describeDuplicate(
	context: LinkContext,
	label: string,
	files: readonly DiskFile[],
): ReportDuplicate {
	return {
		label,
		files: files.map((file) => ({
			path: file.path,
			quality: describeQuality(
				null,
				context.jellyfin.byInode.get(file.inode) ?? null,
			),
			sizeBytes: file.sizeBytes,
			torrentCount: context.torrentsByInode.get(file.inode)?.length ?? 0,
		})),
	};
}
