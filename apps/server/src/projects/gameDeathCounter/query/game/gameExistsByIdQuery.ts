import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

// Le jeu d'un autre compte n'existe pas pour celui-ci
export async function gameExistsByIdQuery(
	userId: number,
	id: number,
): Promise<boolean> {
	try {
		const gameCount = await Game.count({ where: { id, userId } });
		return gameCount > 0;
	} catch (error) {
		throw new DatabaseError("Failed to check game existence", { cause: error });
	}
}
