import { pluralize } from "@citadel/common/src/universal/string/pluralize";

type UnsentContactMessagesDescription = {
	// La pastille de la carte
	status: string;
	message: string;
};

// L'alerte de la carte Site quand des messages de contact attendent en base : quelqu'un attend une réponse, et la relance
// du soir (job contact-retry) les renvoie. null s'il n'y en a aucun
export function describeUnsentContactMessages(
	count: number | null,
): UnsentContactMessagesDescription | null {
	if (count === null || count === 0) return null;

	const isPlural = count > 1;
	return {
		status: `${pluralize(count, "message")} en attente`,
		message: `${pluralize(count, "message")} de contact ${isPlural ? "n'ont" : "n'a"} pas pu être notifié${isPlural ? "s" : ""} et ${isPlural ? "attendent" : "attend"} en base (mailing_contact_message_unsent) : renvoyé${isPlural ? "s" : ""} chaque soir à 23 h 50.`,
	};
}
