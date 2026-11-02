import { DatabaseError } from "../../../error/DatabaseError.ts";
import type { ContactMessageBean } from "../bean/contactMessageBean.type.ts";
import { ContactMessageUnsent } from "../models/ContactMessageUnsent.ts";

// Garde le message complet, sans l'IP : le visiteur n'est pas perdu si sa notification n'a pas pu partir
export async function createContactMessageUnsentQuery({
	subject,
	message,
	name,
	email,
}: ContactMessageBean): Promise<void> {
	try {
		await ContactMessageUnsent.create({ subject, message, name, email });
	} catch (error) {
		throw new DatabaseError("Failed to keep an unsent contact message", {
			cause: error,
		});
	}
}
