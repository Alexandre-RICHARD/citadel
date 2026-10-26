import type { UserVersionDataBean } from "./userVersionDataBean.type.ts";

// `undefined` : champ non modifié (mise à jour partielle)
export type UpdateUserVersionBean = {
	id: number;
	changes: {
		[Field in keyof UserVersionDataBean]?:
			UserVersionDataBean[Field] | undefined;
	};
};
