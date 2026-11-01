import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import type { ContactMessageBean } from "../bean/contactMessageBean.type.ts";

const parisDateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	timeZone: "Europe/Paris",
	dateStyle: "full",
	timeStyle: "short",
});

// À `contact`, donc dans ta boîte : tout le message, et le visiteur en Reply-To pour lui répondre d'un clic
export function buildContactNotificationMail(
	{ subject, message, email, name }: ContactMessageBean,
	sentAt: Date,
): Mail {
	return {
		kind: MailKindEnum.CONTACT_NOTIFICATION,
		to: CONTACT_ADDRESS,
		replyTo: email === null ? null : { email, name },
		subject: `[Contact] ${subject}`,
		...buildMailBodies({
			paragraphs: [
				"Nouveau message depuis le formulaire de contact d'alexandre-richard.fr.",
				[
					`Nom : ${name ?? "non donné"}`,
					`Email : ${email ?? "non donné"}`,
					`Date : ${parisDateTimeFormat.format(sentAt)}`,
				].join("\n"),
				`Sujet : ${subject}`,
				`Message :\n${message}`,
			],
			note:
				email === null
					? "Le visiteur n'a pas laissé d'adresse : ce message n'appelle pas de réponse."
					: "Répondre à ce mail écrit directement au visiteur, depuis contact.",
		}),
	};
}
