import { DatabaseError } from "../../../error/DatabaseError.ts";
import { ContactMessageUnsent } from "../models/ContactMessageUnsent.ts";

export async function countContactMessagesUnsentQuery(): Promise<number> {
	try {
		return await ContactMessageUnsent.count();
	} catch (error) {
		throw new DatabaseError("Failed to count unsent contact messages", {
			cause: error,
		});
	}
}
