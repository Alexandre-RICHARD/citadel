import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

// false : aucun jeu de ce compte n'a cet id, qu'il n'existe pas ou soit à un autre
export async function deleteGameQuery(
	userId: number,
	id: number,
): Promise<boolean> {
	try {
		const deletedRowCount = await Game.destroy({ where: { id, userId } });
		return deletedRowCount > 0;
	} catch (error) {
		throw new DatabaseError("Failed to delete game", { cause: error });
	}
}
