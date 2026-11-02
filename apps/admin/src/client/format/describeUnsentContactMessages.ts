import { pluralize } from "@citadel/common/src/universal/string/pluralize";

type UnsentContactMessagesDescription = {
	// La pastille de la carte
	status: string;
	message: string;
};

// L'alerte de la carte Site quand des messages de contact attendent en base : quelqu'un attend une réponse. null s'il n'y en
// a aucun
export function describeUnsentContactMessages(
	count: number | null,
): UnsentContactMessagesDescription | null {
	if (count === null || count === 0) return null;

	const isPlural = count > 1;
	return {
		status: `${pluralize(count, "message")} à lire`,
		message: `${pluralize(count, "message")} de contact ${isPlural ? "n'ont" : "n'a"} pas pu être notifié${isPlural ? "s" : ""} et ${isPlural ? "attendent" : "attend"} en base (contact_message_unsent). À supprimer une fois lu${isPlural ? "s" : ""}.`,
	};
}
