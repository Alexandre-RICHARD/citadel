import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CreateBossBean } from "../../bean/createBoss.bean.ts";
import { Boss } from "../../models/Boss.ts";

export async function createBossQuery(
	createBossBean: CreateBossBean,
): Promise<Boss> {
	try {
		const newBoss = await Boss.create({
			name: createBossBean.name,
			gameId: createBossBean.gameId,
			defeatedAt: null,
		});
		return newBoss;
	} catch (error) {
		throw new DatabaseError("Failed to insert new boss", { cause: error });
	}
}
