import type { UserVersionDataBean } from "./userVersionDataBean.type.ts";

export type NewUserVersionBean = UserVersionDataBean & {
	versionId: number;
	platformId: number;
	doneDlcIds: number[];
};
