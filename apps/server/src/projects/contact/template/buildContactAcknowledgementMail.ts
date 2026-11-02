import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail.ts";

import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import type { MailBlock } from "../../../mail/template/mailBlock.type.ts";

const DELAY_CALLOUT: MailBlock = {
	kind: "callout",
	accent: MailAccentEnum.ORANGE,
	title: "Un accusé de réception en retard",
	text: "Cet accusé de réception te parvient avec du retard : un incident technique l'a empêché de partir plus tôt. Ton message, lui, n'a pas été perdu.",
};

/**
 * Au visiteur qui a donné son adresse. Du visiteur, seul le sujet est repris : ni son nom ni son message, sinon le
 * formulaire servirait à envoyer n'importe quel texte à n'importe quelle adresse, au nom du domaine
 */
export function buildContactAcknowledgementMail(
	email: string,
	subject: string,
	// Relance du soir : l'accusé n'était pas parti, ou pas son message. Il le dit
	{ isDelayed }: { isDelayed: boolean } = { isDelayed: false },
): Mail {
	return {
		kind: MailKindEnum.CONTACT_ACKNOWLEDGEMENT,
		to: { email, name: null },
		replyTo: CONTACT_ADDRESS,
		subject: `Message bien reçu : ${subject}`,
		...buildMailBodies({
			preview: `Ton message « ${subject} » est bien arrivé : je te réponds dès que possible.`,
			accent: MailAccentEnum.MAGENTA,
			kicker: "Formulaire de contact",
			title: "Message bien reçu",
			lead: "Merci de m'avoir écrit.",
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				{
					kind: "paragraph",
					text: "Ton message, envoyé depuis le formulaire de contact du site, est bien arrivé. Je le lis et te réponds dès que possible, à cette adresse email.",
				},
				{
					kind: "quote",
					label: "Le sujet de ta demande",
					text: subject,
					isProminent: true,
				},
				...(isDelayed ? [DELAY_CALLOUT] : []),
				{
					kind: "paragraph",
					text: `Pour le compléter, réponds simplement à cet email, ou écris à ${CONTACT_EMAIL}.`,
				},
				{
					kind: "button",
					label: "Découvrir les projets",
					href: MAIL_SITE.url,
				},
				{ kind: "signature", name: "Alexandre", href: MAIL_SITE.url },
			],
			note: [
				"Tu reçois cet email parce que cette adresse email a été donnée dans le formulaire de contact du site. Si ce n'est pas toi, ignore-le : rien d'autre ne te sera envoyé.",
				"Si tu remplis un autre formulaire de contact dans la même journée, tu ne recevras pas d'autre accusé de réception.",
			].join("\n"),
		}),
	};
}
