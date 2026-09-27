import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { sequelize } from "../../../../sequelize.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

/**
 * Supprime la mort et décrémente Boss.totalDeath dans une même transaction
 * @returns `false` si aucune mort n'a cet id
 */
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
				where: { id: death.bossId },
				transaction,
			});

			return true;
		});
	} catch {
		throw new DatabaseError("Failed to delete death");
	}
}
