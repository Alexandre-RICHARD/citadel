import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import type { UserVersionDraft } from "./userVersionDraft.type";

// Valeurs par défaut d'une nouvelle version jouée (cahier des charges, §7)
export const DEFAULT_USER_VERSION_DRAFT: UserVersionDraft = {
	versionId: null,
	platformId: null,
	status: StatusEnum.NOT_STARTED,
	isOwned: false,
	isUpNext: false,
	finishDate: null,
	sureFinishCount: 0,
	probableFinishCount: 0,
	trackedPlayTimeMinutes: 0,
	estimatedPlayTimeMinutes: 0,
	rating: null,
	comment: null,
	doneDlcIds: [],
};
