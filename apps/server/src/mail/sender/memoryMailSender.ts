import type { Mail } from "../mail.type.ts";

// Pour les tests (MAIL_SENDER=memory) : chaque mail est gardé, dans l'ordre d'envoi
export const memoryMailSender = {
	sentMails: [] as Mail[],
	send(mail: Mail): Promise<void> {
		this.sentMails.push(mail);
		return Promise.resolve();
	},
};
