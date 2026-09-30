import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";

/**
 * Crée la mort et incrémente Boss.totalDeath dans une même transaction
 * @returns `null` si aucun boss n'a cet id
 */
export async function addDeathQuery(
	bossId: number,
	date: Date,
): Promise<Death | null> {
	try {
		return await sequelize.transaction(async (transaction) => {
			const bossCount = await Boss.count({
				where: { id: bossId },
				transaction,
			});
			if (bossCount === 0) return null;

			const death = await Death.create(
				// comment a besoin d'une valeur explicite, sinon l'instance retournée aurait `undefined` et non `null`
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
