import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

export async function findFlowByTokenHashQuery(
	tokenHash: Buffer,
): Promise<Flow | null> {
	try {
		return await Flow.findOne({ where: { tokenHash } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch flow", { cause: error });
	}
}
