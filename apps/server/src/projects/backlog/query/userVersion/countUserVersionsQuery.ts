import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { UserVersion } from "../../models/UserVersion.ts";

export async function countUserVersionsQuery(): Promise<number> {
	try {
		return await UserVersion.count();
	} catch (error) {
		throw new DatabaseError("Failed to count played versions", {
			cause: error,
		});
	}
}
