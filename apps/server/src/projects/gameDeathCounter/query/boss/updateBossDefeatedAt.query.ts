import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";

export async function updateBossDefeatedAtQuery(
	id: number,
	defeatedAt: Date | null,
): Promise<Boss | null> {
	try {
		// Pas de `Boss.update({ where })` : son nombre de lignes affectées vaut 0
		// quand les valeurs sont identiques, ce qui ne permet pas de détecter un boss inexistant
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
