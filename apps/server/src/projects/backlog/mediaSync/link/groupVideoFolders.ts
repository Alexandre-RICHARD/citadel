import path from "node:path";

import { isVideoFile } from "../disk/isVideoFile.ts";
import { parseFolderName } from "../disk/parseFolderName.ts";
import { topFolderOf } from "../disk/topFolderOf.ts";
import { distinctByInode } from "./distinctByInode.ts";
import type { FolderGroup } from "./folderGroup.type.ts";
import type { LinkContext } from "./linkContext.type.ts";

/**
 * Les fichiers vidéo sous ces dossiers racines, rangés par dossier de film ou de série (« Titre (année) »). `keep` :
 * pour ne garder que ce qu'aucun outil n'a déjà relié
 */
export function groupVideoFolders(
	context: Pick<LinkContext, "disk">,
	roots: readonly string[],
	keep: (inode: number) => boolean = () => true,
): Map<string, FolderGroup> {
	const groups = new Map<string, FolderGroup>();
	for (const root of roots)
		for (const file of context.disk.under(root)) {
			const folder = topFolderOf(file.path, root);
			if (folder === null || !isVideoFile(file.path) || !keep(file.inode))
				continue;
			const group = groups.get(folder) ?? {
				path: folder,
				...parseFolderName(path.posix.basename(folder)),
				files: [],
			};
			group.files = distinctByInode([...group.files, file]);
			groups.set(folder, group);
		}
	return groups;
}
