import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function updateGameEndedAtQuery(
	userId: number,
	id: number,
	endedAt: Date | null,
): Promise<Game | null> {
	try {
		const game = await Game.findOne({ where: { id, userId } });
		if (game === null) return null;

		return await game.update({ endedAt });
	} catch (error) {
		throw new DatabaseError("Failed to update game end date", { cause: error });
	}
}
