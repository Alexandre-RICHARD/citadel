import { CONTACT_ADDRESS } from "../address/contactAddress.ts";
import type { Mail } from "../mail.type.ts";
import { MailKindEnum } from "../mailKind.enum.ts";
import type { MailQuotaLimits } from "../quota/mailQuotaLimits.type.ts";
import { MailThresholdEnum } from "../quota/mailThreshold.enum.ts";
import { buildMailBodies } from "./buildMailBodies.ts";
import { describeQuotaStatuses } from "./describeQuotaStatuses.ts";
import { MailAccentEnum } from "./mailAccent.enum.ts";

type ThresholdWording = {
	subject: string;
	title: string;
	closedFeature: string;
	accent: MailAccentEnum;
};

const WORDINGS: Record<MailThresholdEnum, ThresholdWording> = {
	[MailThresholdEnum.REGISTRATION]: {
		subject: "inscriptions fermées",
		title: "Inscriptions fermées pour aujourd'hui",
		closedFeature: "les inscriptions sont fermées",
		accent: MailAccentEnum.ORANGE,
	},
	[MailThresholdEnum.CONTACT]: {
		subject: "formulaire de contact fermé",
		title: "Formulaire de contact fermé pour aujourd'hui",
		closedFeature: "le formulaire de contact est fermé",
		accent: MailAccentEnum.ORANGE,
	},
	[MailThresholdEnum.DAILY]: {
		subject: "plus aucun envoi",
		title: "Plus aucun mail ne part aujourd'hui",
		closedFeature:
			"plus aucun mail ne part, connexion comprise. Celui-ci est le dernier",
		accent: MailAccentEnum.RED,
	},
};

// À `contact`, donc dans ta boîte : un seuil du quota quotidien vient d'être franchi
export function buildQuotaAlertMail(
	threshold: MailThresholdEnum,
	sentToday: number,
	limits: MailQuotaLimits,
): Mail {
	const { subject, title, closedFeature, accent } = WORDINGS[threshold];
	const { dailyLimit } = limits;
	return {
		kind: MailKindEnum.QUOTA_ALERT,
		to: CONTACT_ADDRESS,
		replyTo: null,
		subject: `[Citadel] Quota de mails : ${subject} pour aujourd'hui`,
		...buildMailBodies({
			preview: `${sentToday} mails envoyés sur ${dailyLimit} : ${closedFeature}.`,
			accent,
			kicker: "Quota de mails",
			title,
			lead: "Un seuil du quota quotidien de Brevo vient d'être franchi.",
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				{
					kind: "paragraph",
					text: `Le site a envoyé ${sentToday} mails aujourd'hui, sur les ${dailyLimit} que permet le quota quotidien de Brevo (tes réponses depuis Gmail comprises) : ${closedFeature}.`,
				},
				{
					kind: "meter",
					value: sentToday,
					max: dailyLimit,
					caption: "mails aujourd'hui",
					marks: [limits.registrationStop, limits.contactStop],
				},
				{
					kind: "statuses",
					statuses: describeQuotaStatuses(threshold, limits),
				},
				{
					kind: "paragraph",
					text: "Tout rouvre seul quand Brevo remet son compteur à zéro, demain. Le bandeau du site prévient les visiteurs en attendant, et l'adresse de contact reste affichée.",
				},
				{
					kind: "paragraph",
					text: "Si ça se répète, regarde les statistiques de Brevo : un pic d'envois peut venir d'un robot qui remplit le formulaire de contact.",
				},
				{
					kind: "button",
					label: "Ouvrir Brevo",
					href: "https://app.brevo.com",
				},
			],
			note: "Une seule alerte par seuil et par jour (une de plus après un redémarrage du serveur).",
		}),
	};
}
