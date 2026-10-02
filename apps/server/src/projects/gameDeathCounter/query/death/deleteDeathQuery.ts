import { Op } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

export async function deleteDeathQuery(id: number): Promise<boolean> {
	try {
		return await sequelize.transaction(async (transaction) => {
			// Verrou exclusif dès la lecture : une suppression simultanée de la même mort attend la fin
			// de celle-ci, puis ne la trouve plus (404) au lieu d'échouer sur une ligne déjà supprimée
			const death = await Death.findByPk(id, {
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			if (death === null) return false;

			await Death.destroy({ where: { id }, transaction });

			await Boss.decrement("totalDeath", {
				by: 1,
				where: { id: death.bossId, totalDeath: { [Op.gt]: 0 } },
				transaction,
			});

			return true;
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete death", { cause: error });
	}
}
