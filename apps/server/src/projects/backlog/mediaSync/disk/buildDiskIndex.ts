import type { DiskFile } from "./diskFile.type.ts";
import type { DiskIndex } from "./diskIndex.type.ts";

// Chaque fichier est rangé sous tous ses dossiers parents : « tout ce qui est sous ce dossier » se lit sans tout parcourir
function addToAncestors(
	byFolder: Map<string, DiskFile[]>,
	file: DiskFile,
): void {
	let end = file.path.lastIndexOf("/");
	while (end > 0) {
		const folder = file.path.slice(0, end + 1);
		byFolder.set(folder, [...(byFolder.get(folder) ?? []), file]);
		end = file.path.lastIndexOf("/", end - 1);
	}
}

export function buildDiskIndex(files: readonly DiskFile[]): DiskIndex {
	const byFolder = new Map<string, DiskFile[]>();
	const pathsByInode = new Map<number, string[]>();
	for (const file of files) {
		addToAncestors(byFolder, file);
		pathsByInode.set(file.inode, [
			...(pathsByInode.get(file.inode) ?? []),
			file.path,
		]);
	}
	return {
		byPath: new Map(files.map((file) => [file.path, file])),
		pathsByInode,
		under: (folder) =>
			byFolder.get(folder.endsWith("/") ? folder : `${folder}/`) ?? [],
	};
}
