import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { UpdateGameBean } from "../../bean/updateGameBean.type.ts";
import { Game } from "../../models/Game.ts";

export async function updateGameQuery(
	userId: number,
	updateGameBean: UpdateGameBean,
): Promise<Game | null> {
	try {
		const game = await Game.findOne({
			where: { id: updateGameBean.id, userId },
		});
		if (game === null) return null;

		return await game.update({ name: updateGameBean.name });
	} catch (error) {
		throw new DatabaseError("Failed to update game", { cause: error });
	}
}
