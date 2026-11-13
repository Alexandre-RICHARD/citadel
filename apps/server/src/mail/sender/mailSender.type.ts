import type { Mail } from "../mail.type.ts";

// Seul point de contact avec le fournisseur : en changer ne touche qu'une implémentation
export type MailSender = {
	// Rejette une BadGatewayError MAIL_UNAVAILABLE si l'email n'est pas parti
	send: (mail: Mail) => Promise<void>;
};
