import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Game } from "../../models/Game.ts";

export async function getGameWithBossesByIdQuery(
	id: number,
): Promise<Game | null> {
	try {
		const gameWithBosses = await Game.findByPk(id, {
			include: { model: Boss, as: "bosses" },
			order: [
				[{ model: Boss, as: "bosses" }, "createdAt", "ASC"],
				[{ model: Boss, as: "bosses" }, "id", "ASC"],
			],
		});
		return gameWithBosses;
	} catch (error) {
		throw new DatabaseError("Failed to fetch game with bosses", {
			cause: error,
		});
	}
}
