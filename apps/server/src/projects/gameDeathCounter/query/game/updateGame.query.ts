import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateGameBean } from "../../bean/updateGame.bean.ts";
import { Game } from "../../models/Game.ts";

export async function updateGameQuery(
	updateGameBean: UpdateGameBean,
): Promise<Game | null> {
	try {
		const game = await Game.findByPk(updateGameBean.id);
		if (game === null) return null;

		return await game.update({ name: updateGameBean.name });
	} catch {
		throw new DatabaseError("Failed to update game");
	}
}
