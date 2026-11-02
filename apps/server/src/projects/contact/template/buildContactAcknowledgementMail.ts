import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail.ts";

import { CONTACT_ADDRESS } from "../../../mail/address/contactAddress.ts";
import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";

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
			paragraphs: [
				"Bonjour,",
				`Votre message « ${subject} », envoyé depuis le formulaire de contact d'alexandre-richard.fr, est bien arrivé. Je le lis et vous réponds dès que possible, à cette adresse.`,
				...(isDelayed
					? [
							"Cet accusé de réception vous parvient avec du retard : un incident technique l'a empêché de partir plus tôt. Votre message, lui, n'a pas été perdu.",
						]
					: []),
				`Pour le compléter, répondez simplement à ce mail, ou écrivez à ${CONTACT_EMAIL}.`,
				"Alexandre\nhttps://alexandre-richard.fr",
			],
			note: [
				"Vous recevez ce mail parce que cette adresse a été donnée dans le formulaire de contact du site. Si ce n'est pas vous, ignorez-le : rien d'autre ne vous sera envoyé.",
				"Si vous remplissez un autre formulaire de contact dans la même journée, vous ne recevrez pas d'autre accusé de réception.",
			].join("\n"),
		}),
	};
}
