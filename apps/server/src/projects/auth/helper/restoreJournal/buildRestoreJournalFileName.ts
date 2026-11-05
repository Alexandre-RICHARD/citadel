// Un fichier par jour (UTC) : la purge efface des fichiers entiers, sans jamais réécrire celui du jour
export function buildRestoreJournalFileName(date: Date): string {
	return `${date.toISOString().slice(0, "YYYY-MM-DD".length)}.jsonl`;
}
