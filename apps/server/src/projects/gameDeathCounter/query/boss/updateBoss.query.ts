import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateBossBean } from "../../bean/updateBoss.bean.ts";
import { Boss } from "../../models/Boss.ts";

export async function updateBossQuery(
	updateBossBean: UpdateBossBean,
): Promise<Boss | null> {
	try {
		// Pas de `Boss.update({ where })` : son nombre de lignes affectées vaut 0
		// quand les valeurs sont identiques, ce qui ne permet pas de détecter un boss inexistant
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
