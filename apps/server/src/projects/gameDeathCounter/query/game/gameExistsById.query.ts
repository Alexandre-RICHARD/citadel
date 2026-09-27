import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function gameExistsByIdQuery(id: number): Promise<boolean> {
	try {
		const gameCount = await Game.count({ where: { id } });
		return gameCount > 0;
	} catch {
		throw new DatabaseError("Failed to check game existence");
	}
}
