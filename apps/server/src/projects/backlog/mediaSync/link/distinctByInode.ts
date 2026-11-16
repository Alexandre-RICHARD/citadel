import type { DiskFile } from "../disk/diskFile.type.ts";

// Les fichiers distincts : deux noms d'un même fichier (liens physiques) n'en font qu'un
export function distinctByInode(files: readonly DiskFile[]): DiskFile[] {
	return [...new Map(files.map((file) => [file.inode, file])).values()];
}
