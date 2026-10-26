import type { PlatformFm } from "./platformFm.type";
import type { VersionPlatformFm } from "./versionPlatformFm.type";

export type GamePreviewVersionFm = {
	id: number;
	// null pour la version originale, qui affiche le nom du jeu
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	// Toujours enregistrée : elle porte l'id et la page IGDB du jeu
	isOriginal: boolean;
	isStored: boolean;
	platforms: VersionPlatformFm[];
	platformOptions: PlatformFm[];
};
