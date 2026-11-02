import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

// Sans effet sur un jeton inconnu
export async function deleteFlowByTokenHashQuery(
	tokenHash: Buffer,
): Promise<void> {
	try {
		await Flow.destroy({ where: { tokenHash } });
	} catch (error) {
		throw new DatabaseError("Failed to delete flow", { cause: error });
	}
}
