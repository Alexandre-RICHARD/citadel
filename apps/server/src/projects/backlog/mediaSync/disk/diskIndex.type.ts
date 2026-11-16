import type { DiskFile } from "./diskFile.type.ts";

/**
 * Les fichiers du disque, rangés pour le job : par chemin, par inode (les noms d'un même fichier), et par dossier
 * (`under` : tout ce qui est sous un dossier, à toute profondeur)
 */
export type DiskIndex = {
	byPath: ReadonlyMap<string, DiskFile>;
	pathsByInode: ReadonlyMap<number, readonly string[]>;
	under: (folder: string) => readonly DiskFile[];
};
