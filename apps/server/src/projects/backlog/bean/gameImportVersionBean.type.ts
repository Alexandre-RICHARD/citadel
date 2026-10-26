import type { VersionPlatformBean } from "./versionPlatformBean.type.ts";

export type GameImportVersionBean = {
	id: number;
	// null pour la version originale
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	platforms: VersionPlatformBean[];
};
