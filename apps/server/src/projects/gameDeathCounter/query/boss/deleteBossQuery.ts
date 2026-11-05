import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";
import { ownedGameIds } from "../ownership/ownedGameIds.ts";

// false : aucun boss de ce compte n'a cet id ; ses morts partent avec lui par cascade
export async function deleteBossQuery(
	userId: number,
	id: number,
): Promise<boolean> {
	try {
		const deletedRowCount = await Boss.destroy({
			where: { id, gameId: ownedGameIds(userId) },
		});
		return deletedRowCount > 0;
	} catch (error) {
		throw new DatabaseError("Failed to delete boss", { cause: error });
	}
}
