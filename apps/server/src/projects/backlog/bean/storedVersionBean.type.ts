import type { PlatformBean } from "./platformBean.type.ts";
import type { VersionPlatformBean } from "./versionPlatformBean.type.ts";

export type StoredVersionBean = {
	id: number;
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	platforms: VersionPlatformBean[];
	platformOptions: PlatformBean[];
};
