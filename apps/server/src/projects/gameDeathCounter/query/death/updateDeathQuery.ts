import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateDeathBean } from "../../bean/updateDeathBean.type.ts";
import { Death } from "../../models/Death.ts";

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
