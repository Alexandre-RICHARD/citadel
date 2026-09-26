import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function getGameByIdQuery(id: number): Promise<Game | null> {
	try {
		return await Game.findByPk(id);
	} catch {
		throw new DatabaseError("Failed to fetch game");
	}
}
