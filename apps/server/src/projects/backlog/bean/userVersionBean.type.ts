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
};
