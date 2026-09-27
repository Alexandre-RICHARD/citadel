import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateDeathBean } from "../../bean/updateDeath.bean.ts";
import { Death } from "../../models/Death.ts";

/**
 * Ne modifie que les champs renseignés (différents de `undefined`) du bean
 * @returns `null` si aucune mort n'a cet id
 */
export async function updateDeathQuery(
	updateDeathBean: UpdateDeathBean,
): Promise<Death | null> {
	try {
		const death = await Death.findByPk(updateDeathBean.id);
		if (death === null) return null;

		const changes: { date?: Date; comment?: string | null } = {};
		if (updateDeathBean.date !== undefined) changes.date = updateDeathBean.date;
		if (updateDeathBean.comment !== undefined)
			changes.comment = updateDeathBean.comment;

		return await death.update(changes);
	} catch (error) {
		throw new DatabaseError("Failed to update death", { cause: error });
	}
}
