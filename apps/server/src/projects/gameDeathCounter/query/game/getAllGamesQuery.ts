import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function getAllGamesQuery(userId: number): Promise<Game[]> {
	try {
		const allGames = await Game.findAll({
			where: { userId },
			order: [
				["name", "ASC"],
				["id", "ASC"],
			],
		});
		return allGames;
	} catch (error) {
		throw new DatabaseError("Failed to fetch games", { cause: error });
	}
}
