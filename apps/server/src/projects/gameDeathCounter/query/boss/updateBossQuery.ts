import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateBossBean } from "../../bean/updateBossBean.type.ts";
import { Boss } from "../../models/Boss.ts";

export async function updateBossQuery(
	updateBossBean: UpdateBossBean,
): Promise<Boss | null> {
	try {
		const boss = await Boss.findByPk(updateBossBean.id);
		if (boss === null) return null;

		const updatedBoss = await boss.update({
			name: updateBossBean.name,
			gameId: updateBossBean.gameId,
		});
		return updatedBoss;
	} catch (error) {
		throw new DatabaseError("Failed to update boss", { cause: error });
	}
}
