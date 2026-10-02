import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";

export async function updateBossDefeatedAtQuery(
	id: number,
	defeatedAt: Date | null,
): Promise<Boss | null> {
	try {
		const boss = await Boss.findByPk(id);
		if (boss === null) return null;

		const updatedBoss = await boss.update({ defeatedAt });
		return updatedBoss;
	} catch (error) {
		throw new DatabaseError("Failed to update boss defeat date", {
			cause: error,
		});
	}
}
