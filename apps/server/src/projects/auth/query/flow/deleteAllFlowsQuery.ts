import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

// Tous les parcours en cours : après une restauration, leurs codes et leurs liens ne doivent plus rien ouvrir
export async function deleteAllFlowsQuery(): Promise<number> {
	try {
		return await Flow.destroy({ where: {} });
	} catch (error) {
		throw new DatabaseError("Failed to delete every flow", { cause: error });
	}
}
