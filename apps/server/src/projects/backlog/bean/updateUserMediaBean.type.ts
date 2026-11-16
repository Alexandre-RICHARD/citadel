import type { UserMediaChangesBean } from "./userMediaChangesBean.type.ts";

export type UpdateUserMediaBean = {
	userMediaId: number;
	changes: UserMediaChangesBean;
};
