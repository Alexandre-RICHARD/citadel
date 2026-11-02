import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { Flow } from "../../models/Flow.ts";

export async function findFlowByLinkTokenHashQuery(
	linkTokenHash: Buffer,
): Promise<Flow | null> {
	try {
		return await Flow.findOne({ where: { linkTokenHash } });
	} catch (error) {
		throw new DatabaseError("Failed to fetch flow by link", { cause: error });
	}
}
