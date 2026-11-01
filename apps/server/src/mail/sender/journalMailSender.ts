import type { Mail } from "../mail.type.ts";
import type { MailSender } from "./mailSender.type.ts";

// Aucun envoi : une ligne dans le log dit qu'un mail serait parti, sans son contenu ni ses adresses
export const journalMailSender: MailSender = {
	send(mail: Mail): Promise<void> {
		/* eslint-disable-next-line no-console */
		console.log(`[mail] Non envoyé (MAIL_SENDER=journal) : ${mail.kind}`);
		return Promise.resolve();
	},
};
