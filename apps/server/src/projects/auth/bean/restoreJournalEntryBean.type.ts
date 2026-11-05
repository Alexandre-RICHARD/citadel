import type { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";

import type { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";

// Une ligne du journal de restauration, sans sa date : de quoi refaire l'action sur une base restaurée
export type RestoreJournalEntryBean = { userId: number } & (
	| {
			action:
				| RestoreJournalActionEnum.ACCOUNT_DELETED
				| RestoreJournalActionEnum.SECURITY_CHANGED;
	  }
	| {
			action: RestoreJournalActionEnum.PROJECT_DATA_DELETED;
			projects: readonly UserDataProjectEnum[];
	  }
	| { action: RestoreJournalActionEnum.EMAIL_CHANGED; email: string }
);
