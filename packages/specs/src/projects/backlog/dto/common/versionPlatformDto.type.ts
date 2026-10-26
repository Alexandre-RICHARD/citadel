import type { PlatformDto } from "./platformDto.type.ts";

// Une plateforme d'une version et la plus ancienne date de sortie de la version sur celle-ci
export type VersionPlatformDto = {
	platform: PlatformDto;
	releaseDate: string | null;
};
