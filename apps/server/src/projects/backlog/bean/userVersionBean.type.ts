import type { PlatformBean } from "./platformBean.type.ts";
import type { UserVersionDataBean } from "./userVersionDataBean.type.ts";

export type UserVersionBean = UserVersionDataBean & {
	id: number;
	version: {
		id: number;
		title: string | null;
		coverImageId: string | null;
		igdbUrl: string;
	};
	platform: PlatformBean;
	releaseDate: string | null;
	doneDlcIds: number[];
	// Dernière création ou modification de cette version jouée : sans tri choisi, la plus récente passe en premier
	updatedAt: Date;
};
