import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function updateGameEndedAtQuery(
	id: number,
	endedAt: Date | null,
): Promise<Game | null> {
	try {
		const game = await Game.findByPk(id);
		if (game === null) return null;

		return await game.update({ endedAt });
	} catch {
		throw new DatabaseError("Failed to update game end date");
	}
}
