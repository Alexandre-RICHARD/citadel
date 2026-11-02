import { toExcerpt } from "@citadel/common/src/universal/string/toExcerpt.ts";

import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import { buildMailtoHref } from "../../../mail/template/buildMailtoHref.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import type { MailBlock } from "../../../mail/template/mailBlock.type.ts";
import type { ContactMessageBean } from "../bean/contactMessageBean.type.ts";

const parisDateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
	timeZone: "Europe/Paris",
	dateStyle: "full",
	timeStyle: "short",
});

const MISSING = "non donné";

const PREVIEW_MAX_LENGTH = 140;

const DELAY_CALLOUT: MailBlock = {
	kind: "callout",
	accent: MailAccentEnum.ORANGE,
	title: "Une notification en retard",
	text: "Cette notification te parvient avec du retard : un incident technique l'a empêchée de partir plus tôt. La date ci-dessous est celle où le visiteur a écrit.",
};

type NotificationOptions = {
	// Relance du soir d'un message dont l'envoi avait échoué : même contenu, sujet suivi de « (différé) »
	isDelayed: boolean;
};

// Le bouton qui répond au visiteur, son objet déjà rempli ; aucun sans adresse
function replyBlocks(
	email: string | null,
	name: string | null,
	subject: string,
): MailBlock[] {
	if (email === null) return [];
	return [
		{
			kind: "button",
			label: `Répondre à ${name ?? email}`,
			href: buildMailtoHref(email, `Re: ${subject}`),
		},
	];
}

// À `contact`, donc dans ta boîte : tout le message, et le visiteur en Reply-To pour lui répondre d'un clic.
// `sentAt` : la date où le visiteur a écrit
export function buildContactNotificationMail(
	{
		subject,
		message,
		email,
		name,
	}: Pick<ContactMessageBean, "subject" | "message" | "email" | "name">,
	sentAt: Date,
	{ isDelayed }: NotificationOptions = { isDelayed: false },
): Mail {
	const author = name ?? "Un visiteur";
	return {
		kind: MailKindEnum.CONTACT_NOTIFICATION,
		to: CONTACT_ADDRESS,
		replyTo: email === null ? null : { email, name },
		subject: `[Contact] ${subject}${isDelayed ? " (différé)" : ""}`,
		...buildMailBodies({
			preview: toExcerpt(`${author} : ${message}`, PREVIEW_MAX_LENGTH),
			accent: MailAccentEnum.VIOLET,
			kicker: "Nouveau message",
			title: subject,
			lead: `${author} a écrit depuis le formulaire de contact d'${MAIL_SITE.host}.`,
			blocks: [
				...(isDelayed ? [DELAY_CALLOUT] : []),
				{
					kind: "fields",
					fields: [
						{ label: "Nom", value: name ?? MISSING, isMissing: name === null },
						email === null
							? { label: "Email", value: MISSING, isMissing: true }
							: {
									label: "Email",
									value: email,
									href: buildMailtoHref(email, `Re: ${subject}`),
								},
						{ label: "Date", value: parisDateTimeFormat.format(sentAt) },
					],
				},
				{ kind: "quote", label: "Message", text: message, isProminent: false },
				...replyBlocks(email, name, subject),
			],
			note:
				email === null
					? "Le visiteur n'a pas laissé d'adresse email : ce message n'appelle pas de réponse."
					: "Répondre à cet email écrit directement au visiteur, depuis contact.",
		}),
	};
}
