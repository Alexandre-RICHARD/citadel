import type { DiskFile } from "../disk/diskFile.type.ts";

// Un dossier de film ou de série sous medias/, son nom lu (« Titre (année) ») et ses fichiers vidéo distincts
export type FolderGroup = {
	path: string;
	title: string;
	year: number | null;
	files: DiskFile[];
};
