import { Op } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Death } from "../../models/Death.ts";
import { ownedBossIds } from "../ownership/ownedBossIds.ts";

/**
 * La propriété se vérifie avant la transaction. Dedans, sous verrou, la sous-requête de propriété verrouillerait aussi
 * les boss en partagé, et deux suppressions sur un même boss s'interbloqueraient en décrémentant son compteur ; sans
 * verrou, elle ouvrirait un instantané, et MariaDB refuserait ensuite de verrouiller un boss modifié depuis. Le boss
 * d'une mort ne quitte jamais le compte : la vérification reste vraie
 */
export async function deleteDeathQuery(
	userId: number,
	id: number,
): Promise<boolean> {
	try {
		const ownedDeath = await Death.findOne({
			where: { id, bossId: ownedBossIds(userId) },
		});
		if (ownedDeath === null) return false;

		return await sequelize.transaction(async (transaction) => {
			// Le boss d'abord, en exclusif, comme l'ajout d'une mort : ajouts et suppressions sur un même boss se suivent
			await Boss.findByPk(ownedDeath.bossId, {
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			// Une suppression simultanée de la même mort est passée avant : elle n'existe plus (404)
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
