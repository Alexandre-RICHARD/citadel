import { DatabaseError } from "../../../error/DatabaseError.ts";
import { ContactMessageUnsent } from "../models/ContactMessageUnsent.ts";

// Les plus anciens d'abord : la relance les renvoie dans l'ordre où les visiteurs ont écrit
export async function findContactMessagesUnsentQuery(): Promise<
	ContactMessageUnsent[]
> {
	try {
		return await ContactMessageUnsent.findAll({ order: [["id", "ASC"]] });
	} catch (error) {
		throw new DatabaseError("Failed to find unsent contact messages", {
			cause: error,
		});
	}
}
