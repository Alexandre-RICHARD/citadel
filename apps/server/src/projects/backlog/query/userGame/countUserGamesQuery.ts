import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserGame } from "../../models/UserGame.ts";

export async function countUserGamesQuery(): Promise<number> {
	try {
		return await UserGame.count();
	} catch (error) {
		throw new DatabaseError("Failed to count backlog games", { cause: error });
	}
}
