import type { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";

import type { RestoreJournalActionEnum } from "../enum/restoreJournalAction.enum.ts";

// Ce qu'un service journalise : de quoi refaire l'action sur une base restaurée. La date et le pseudo s'y ajoutent à l'écriture
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
	// L'empreinte HMAC du code, en hexadécimal : il est déjà utilisé, elle ne permet plus rien
	| { action: RestoreJournalActionEnum.RECOVERY_CODE_USED; codeHash: string }
);
