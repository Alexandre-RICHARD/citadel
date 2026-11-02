import { DatabaseError } from "../../../error/DatabaseError.ts";
import { ContactMessageUnsent } from "../models/ContactMessageUnsent.ts";

export async function deleteContactMessageUnsentQuery(
	id: number,
): Promise<void> {
	try {
		await ContactMessageUnsent.destroy({ where: { id } });
	} catch (error) {
		throw new DatabaseError("Failed to delete an unsent contact message", {
			cause: error,
		});
	}
}
