import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function getAllGamesQuery(): Promise<Game[]> {
	try {
		const allGames = await Game.findAll();
		return allGames;
	} catch {
		throw new DatabaseError("Failed to fetch games");
	}
}
