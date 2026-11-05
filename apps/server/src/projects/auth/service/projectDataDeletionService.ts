import type { UserDataProjectEnum } from "@citadel/specs/src/projects/auth/enum/userDataProject.enum.ts";
import type { Transaction } from "sequelize";

import { runInTransaction } from "../../../common/database/runInTransaction.ts";
import type { ClientContextBean } from "../bean/clientContextBean.type.ts";
import { AuthEventTypeEnum } from "../enum/authEventType.enum.ts";
import { projectUserData } from "../projectData/projectUserData.ts";
import { shareLockUserQuery } from "../query/user/shareLockUserQuery.ts";
import { authEventService } from "./authEventService.ts";
import { passwordConfirmationService } from "./passwordConfirmationService.ts";

/**
 * Les données du compte dans les projets : supprimées une à une par chaque projet, dans l'ordre que demandent ses clés
 * étrangères, jamais laissées aux cascades de auth_user (cahier de l'authentification, §5.1)
 */
class ProjectDataDeletionService {
	// Dans la transaction de la suppression du compte, avant le compte lui-même
	async deleteAllProjects(
		userId: number,
		transaction: Transaction,
	): Promise<void> {
		for (const data of Object.values(projectUserData))
			// eslint-disable-next-line no-await-in-loop -- une même transaction : ses requêtes se suivent
			await data.deleteAll(userId, transaction);
	}

	/**
	 * « Supprimer les données de ces projets » : immédiat, définitif, tous ou aucun ; le compte reste. Mot de passe
	 * redemandé ; ses échecs comptent comme ceux de la connexion
	 */
	async deleteProjects(
		userId: number,
		projects: readonly UserDataProjectEnum[],
		password: string,
		client: ClientContextBean,
	): Promise<void> {
		await passwordConfirmationService.confirm(userId, password, client);
		await runInTransaction(
			"Failed to delete project data",
			async (transaction) => {
				// Une suppression du compte en même temps passe avant ou après, jamais au milieu
				if (!(await shareLockUserQuery(userId, transaction)))
					throw new Error("Project data deletion of a deleted account");
				for (const project of projects)
					// eslint-disable-next-line no-await-in-loop -- une même transaction : ses requêtes se suivent
					await projectUserData[project].deleteAll(userId, transaction);
			},
		);
		await authEventService.record({
			type: AuthEventTypeEnum.PROJECT_DATA_DELETED,
			userId,
			client,
		});
	}
}

export const projectDataDeletionService = new ProjectDataDeletionService();
