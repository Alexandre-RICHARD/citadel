import { CONTACT_ADDRESS } from "../address/contactAddress.ts";
import type { Mail } from "../mail.type.ts";
import { MailKindEnum } from "../mailKind.enum.ts";
import type { MailQuotaLimits } from "../quota/mailQuotaLimits.type.ts";
import { MailThresholdEnum } from "../quota/mailThreshold.enum.ts";
import { buildMailBodies } from "./buildMailBodies.ts";

type ThresholdWording = {
	subject: string;
	closedFeature: string;
};

const WORDINGS: Record<MailThresholdEnum, ThresholdWording> = {
	[MailThresholdEnum.REGISTRATION]: {
		subject: "inscriptions fermées",
		closedFeature: "les inscriptions sont fermées",
	},
	[MailThresholdEnum.CONTACT]: {
		subject: "formulaire de contact fermé",
		closedFeature: "le formulaire de contact est fermé",
	},
	[MailThresholdEnum.DAILY]: {
		subject: "plus aucun envoi",
		closedFeature:
			"plus aucun mail ne part, connexion comprise. Celui-ci est le dernier",
	},
};

// À `contact`, donc dans ta boîte : un seuil du quota quotidien vient d'être franchi
export function buildQuotaAlertMail(
	threshold: MailThresholdEnum,
	sentToday: number,
	{ dailyLimit }: MailQuotaLimits,
): Mail {
	const { subject, closedFeature } = WORDINGS[threshold];
	return {
		kind: MailKindEnum.QUOTA_ALERT,
		to: CONTACT_ADDRESS,
		replyTo: null,
		subject: `[Citadel] Quota de mails : ${subject} pour aujourd'hui`,
		...buildMailBodies({
			paragraphs: [
				"Bonjour,",
				`Le site a envoyé ${sentToday} mails aujourd'hui, sur les ${dailyLimit} que permet le quota quotidien de Brevo (tes réponses depuis Gmail comprises) : ${closedFeature}.`,
				"Tout rouvre seul quand Brevo remet son compteur à zéro, demain. Le bandeau du site prévient les visiteurs en attendant, et l'adresse de contact reste affichée.",
				"Si ça se répète, regarde les statistiques de Brevo : un pic d'envois peut venir d'un robot qui remplit le formulaire de contact.",
			],
			note: "Une seule alerte par seuil et par jour (une de plus après un redémarrage du serveur).",
		}),
	};
}
