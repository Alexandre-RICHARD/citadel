import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

import { RESTORE_JOURNAL_FILE_NAME } from "./restoreJournalFileName.ts";

/**
 * Les fichiers du journal dont toutes les lignes sont plus vieilles que `cutoff` : celles d'un jour vont jusqu'à minuit
 * (UTC), le fichier part quand ce minuit est passé. Un fichier qui n'est pas du journal n'est jamais désigné
 */
export function findExpiredRestoreJournalFiles(
	fileNames: readonly string[],
	cutoff: Date,
): string[] {
	return fileNames.filter((fileName) => {
		const day = RESTORE_JOURNAL_FILE_NAME.exec(fileName)?.[1];
		if (day === undefined) return false;
		const endOfDay = Date.parse(`${day}T00:00:00.000Z`) + DurationMsEnum.DAY;
		return endOfDay <= cutoff.getTime();
	});
}
