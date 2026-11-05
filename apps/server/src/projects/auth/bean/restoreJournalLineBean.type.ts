import type { RestoreJournalEntryBean } from "./restoreJournalEntryBean.type.ts";

// Une ligne relue du journal de restauration : l'action, sa date, et le pseudo du compte au moment de l'écrire
export type RestoreJournalLineBean = RestoreJournalEntryBean & {
	at: Date;
	username: string;
};
