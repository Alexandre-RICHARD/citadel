import { buildUserDataArchive } from "../../../common/archive/buildUserDataArchive.ts";
import { authExportTables } from "../export/authExportTables.ts";
import { projectUserData } from "../projectData/projectUserData.ts";

// Les tables de l'authentification, puis celles de chaque projet
const exportTables = [
	...authExportTables,
	...Object.values(projectUserData).flatMap((data) => data.exportTables),
];

/**
 * « Télécharger mes données » : un ZIP avec un CSV par table, toutes les lignes de l'utilisateur, aucun secret. Ce
 * service rassemble les tables de l'authentification et de chaque projet
 */
class AccountExportService {
	async buildArchive(userId: number): Promise<Buffer> {
		return buildUserDataArchive(exportTables, userId, new Date());
	}
}

export const accountExportService = new AccountExportService();
