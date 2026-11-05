import type { RestoreJournalLineBean } from "../../../projects/auth/bean/restoreJournalLineBean.type.ts";
import { restoreJournalService } from "../../../projects/auth/service/restoreJournalService.ts";

// Les lignes du journal de restauration d'un compte, lues comme la commande « après restauration » les lit : les tests
// écrivent en parallèle dans le même dossier, chacun ne garde que son compte
export async function readRestoreJournal(
	userId: number,
): Promise<RestoreJournalLineBean[]> {
	const { lines } = await restoreJournalService.readAll();
	return lines.filter((line) => line.userId === userId);
}
