import type { PlatformBean } from "./platformBean.type.ts";
import type { VersionPlatformBean } from "./versionPlatformBean.type.ts";

export type GamePreviewVersionBean = {
	id: number;
	title: string | null;
	coverImageId: string | null;
	igdbUrl: string;
	isStored: boolean;
	platforms: VersionPlatformBean[];
	platformOptions: PlatformBean[];
};
