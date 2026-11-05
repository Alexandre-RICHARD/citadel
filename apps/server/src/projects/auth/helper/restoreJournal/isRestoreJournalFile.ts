import { RESTORE_JOURNAL_FILE_NAME } from "./restoreJournalFileName.ts";

// Seuls les fichiers du journal sont lus ou purgés : rien d'autre posé dans le dossier n'est touché
export function isRestoreJournalFile(fileName: string): boolean {
	return RESTORE_JOURNAL_FILE_NAME.test(fileName);
}
