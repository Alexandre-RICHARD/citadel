import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateBossBean } from "../../bean/updateBossBean.type.ts";
import { Boss } from "../../models/Boss.ts";
import { ownedGameIds } from "../ownership/ownedGameIds.ts";

// Le jeu de destination (`gameId`) est déjà un jeu du compte : le service le vérifie avant
export async function updateBossQuery(
	userId: number,
	updateBossBean: UpdateBossBean,
): Promise<Boss | null> {
	try {
		const boss = await Boss.findOne({
			where: { id: updateBossBean.id, gameId: ownedGameIds(userId) },
		});
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
