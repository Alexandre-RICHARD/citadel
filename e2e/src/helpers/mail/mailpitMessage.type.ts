import type { MailpitAddress } from "./mailpitAddress.type.ts";

// Un mail lu en entier dans Mailpit (GET /message/<ID>)
export type MailpitMessage = {
	ID: string;
	Subject: string;
	Text: string;
	HTML: string;
	To: MailpitAddress[];
	// Absent quand le mail n'a pas d'en-tête Reply-To
	ReplyTo?: MailpitAddress[] | null;
};
