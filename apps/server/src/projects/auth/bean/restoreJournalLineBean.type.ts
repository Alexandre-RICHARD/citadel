import type { RestoreJournalEntryBean } from "./restoreJournalEntryBean.type.ts";

// Une ligne relue du journal de restauration, avec sa date
export type RestoreJournalLineBean = RestoreJournalEntryBean & { at: Date };
