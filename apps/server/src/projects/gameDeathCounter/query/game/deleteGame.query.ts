import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Game } from "../../models/Game.ts";

export async function deleteGameQuery(id: number): Promise<boolean> {
	try {
		const deletedRowCount = await Game.destroy({ where: { id } });
		return deletedRowCount > 0;
	} catch {
		throw new DatabaseError("Failed to delete game");
	}
}
