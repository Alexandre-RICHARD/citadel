import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Boss } from "../../models/Boss.ts";

export async function deleteBossQuery(id: number): Promise<boolean> {
	try {
		const deletedRowCount = await Boss.destroy({ where: { id } });
		return deletedRowCount > 0;
	} catch {
		throw new DatabaseError("Failed to delete boss");
	}
}
