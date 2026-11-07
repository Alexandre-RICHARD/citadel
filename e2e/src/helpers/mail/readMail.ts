import { extractCode } from "./extractCode.ts";
import { extractLink } from "./extractLink.ts";
import { fetchMailpit } from "./fetchMailpit.ts";
import type { MailpitMessage } from "./mailpitMessage.type.ts";
import type { ReceivedMail } from "./receivedMail.type.ts";

/** Lit un mail en entier dans Mailpit, d'après son identifiant, et en sort le lien et le code */
export async function readMail(id: string): Promise<ReceivedMail> {
	const message = await fetchMailpit<MailpitMessage>(`/message/${id}`);
	return {
		subject: message.Subject,
		text: message.Text,
		html: message.HTML,
		to: message.To.map((address) => address.Address),
		replyTo: (message.ReplyTo ?? []).map((address) => address.Address),
		link: extractLink(message.Text),
		code: extractCode(message.Text),
	};
}
