import type { Platform } from "../models/Platform.ts";
import type { Version } from "../models/Version.ts";
import type { VersionPlatform } from "../models/VersionPlatform.ts";

// Version chargée avec `include: versionPlatforms → platform` ; Omit : le modèle déclare ces relations facultatives
export type StoredVersionEntity = Omit<Version, "versionPlatforms"> & {
	versionPlatforms: (Omit<VersionPlatform, "platform"> & {
		platform: Platform;
	})[];
};
