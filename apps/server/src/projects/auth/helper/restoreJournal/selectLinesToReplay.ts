import type { RestoreJournalLineBean } from "../../bean/restoreJournalLineBean.type.ts";

/**
 * Ce que la sauvegarde ne contient pas : les lignes écrites à partir de sa date, dans l'ordre où elles ont eu lieu (deux
 * changements d'email d'un même compte se rejouent dans l'ordre, le dernier gagne). Une ligne écrite à la seconde même
 * de la sauvegarde est rejouée : mieux vaut refaire une action déjà là que l'oublier
 */
export function selectLinesToReplay(
	lines: readonly RestoreJournalLineBean[],
	backupDate: Date,
): RestoreJournalLineBean[] {
	return lines
		.filter((line) => line.at.getTime() >= backupDate.getTime())
		.toSorted((first, second) => first.at.getTime() - second.at.getTime());
}
