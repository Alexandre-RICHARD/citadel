import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

export async function addDeathQuery(
	bossId: number,
	date: Date,
): Promise<Death | null> {
	try {
		return await sequelize.transaction(async (transaction) => {
			// Verrou exclusif sur le boss dès la première lecture : des ajouts simultanés sur un même boss
			// attendent leur tour au lieu de se bloquer mutuellement entre l'insertion et l'incrément
			const boss = await Boss.findByPk(bossId, {
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			if (boss === null) return null;

			const death = await Death.create(
				{
					bossId,
					date,
					comment: null,
				},
				{ transaction },
			);

			await Boss.increment("totalDeath", {
				by: 1,
				where: { id: bossId },
				transaction,
			});

			return death;
		});
	} catch (error) {
		throw new DatabaseError("Failed to add death", { cause: error });
	}
}
