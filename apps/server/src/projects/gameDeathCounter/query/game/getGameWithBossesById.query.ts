import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { Game } from "../../models/Game.ts";

export async function getGameWithBossesByIdQuery(
	id: number,
): Promise<Game | null> {
	try {
		const gameWithBosses = await Game.findByPk(id, {
			include: { model: Boss, as: "bosses" },
		});
		return gameWithBosses;
	} catch {
		throw new DatabaseError("Failed to fetch game with bosses");
	}
}
