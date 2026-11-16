import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum";

// Où est le fichier (§5)
export const nasStorageLabels: Readonly<Record<NasStorageEnum, string>> = {
	[NasStorageEnum.NOT_TRACKED]: "Non suivi",
	[NasStorageEnum.EXPECTED]: "Attendu",
	[NasStorageEnum.DOWNLOADING]: "En téléchargement",
	[NasStorageEnum.PRESENT]: "Présent",
	[NasStorageEnum.IN_JELLYFIN]: "Dans Jellyfin",
};
