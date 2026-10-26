import type { PlatformFm } from "./platformFm.type";
import type { VersionPlatformFm } from "./versionPlatformFm.type";

export type StoredVersionFm = {
	id: number;
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	isOriginal: boolean;
	platforms: VersionPlatformFm[];
	// Celles de la version, puis les émulateurs de ces consoles (cahier des charges, §5)
	platformOptions: PlatformFm[];
};
