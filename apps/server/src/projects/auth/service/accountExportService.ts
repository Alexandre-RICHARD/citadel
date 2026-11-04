import { buildUserDataArchive } from "../../../common/archive/buildUserDataArchive.ts";
import { authExportTables } from "../export/authExportTables.ts";

/**
 * « Télécharger mes données » : un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, aucun secret. Ce
 * service rassemble les tables de chaque projet, à mesure qu'ils passent aux comptes
 */
class AccountExportService {
	async buildArchive(userId: number): Promise<Buffer> {
		return buildUserDataArchive(authExportTables, userId, new Date());
	}
}

export const accountExportService = new AccountExportService();
