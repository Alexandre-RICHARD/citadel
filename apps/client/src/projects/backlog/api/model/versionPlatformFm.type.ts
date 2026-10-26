import type { PlatformFm } from "./platformFm.type";

// Une plateforme d'une version, et la date de sortie de la version sur celle-ci
export type VersionPlatformFm = {
	platform: PlatformFm;
	releaseDate: string | null;
};
