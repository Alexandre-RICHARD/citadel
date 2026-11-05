import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";
import { ownedGameIds } from "../ownership/ownedGameIds.ts";

// La propriété se vérifie avant la transaction, sans verrou : sous verrou, sa sous-requête verrouillerait aussi les jeux
// du compte, et un boss déplacé vers un autre de ses jeux au même moment pourrait s'interbloquer avec cet ajout. Un
// boss ne quitte jamais le compte : la vérification reste vraie
export async function addDeathQuery(
	userId: number,
	bossId: number,
	date: Date,
): Promise<Death | null> {
	try {
		const ownedBossCount = await Boss.count({
			where: { id: bossId, gameId: ownedGameIds(userId) },
		});
		if (ownedBossCount === 0) return null;

		return await sequelize.transaction(async (transaction) => {
			// Verrou exclusif sur le boss dès la première lecture : des ajouts simultanés sur un même boss
			// attendent leur tour au lieu de se bloquer mutuellement entre l'insertion et l'incrément. null : supprimé
			// entre-temps
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
