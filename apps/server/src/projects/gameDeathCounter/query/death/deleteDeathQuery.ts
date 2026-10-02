import { Op } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

export async function deleteDeathQuery(id: number): Promise<boolean> {
	try {
		return await sequelize.transaction(async (transaction) => {
			const death = await Death.findByPk(id, { transaction });
			if (death === null) return false;

			const deletedRowCount = await Death.destroy({
				where: { id },
				transaction,
			});

			if (deletedRowCount === 0) return false;

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
