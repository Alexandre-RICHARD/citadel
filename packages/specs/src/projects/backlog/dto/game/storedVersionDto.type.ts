import type { PlatformDto } from "../common/platformDto.type.ts";
import type { VersionPlatformDto } from "../common/versionPlatformDto.type.ts";

export type StoredVersionDto = {
	id: number;
	// null pour la version originale, qui affiche le nom du jeu
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	platforms: VersionPlatformDto[];
	// Plateformes proposées pour une version jouée : celles de la version, puis les émulateurs de ces consoles
	platformOptions: PlatformDto[];
};
