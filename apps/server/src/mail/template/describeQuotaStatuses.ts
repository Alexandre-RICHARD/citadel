import type { MailQuotaLimits } from "../quota/mailQuotaLimits.type.ts";
import { MailThresholdEnum } from "../quota/mailThreshold.enum.ts";
import type { MailStatus } from "./mailStatus.type.ts";

type QuotaFeature = {
	threshold: MailThresholdEnum;
	label: string;
	describeLimit: (limits: MailQuotaLimits) => string;
	closedState: string;
	openState: string;
};

// Dans l'ordre où les seuils se franchissent
const QUOTA_FEATURES: QuotaFeature[] = [
	{
		threshold: MailThresholdEnum.REGISTRATION,
		label: "Inscriptions",
		describeLimit: ({ registrationStop }) =>
			`Ferment à ${registrationStop} envois`,
		closedState: "Fermées",
		openState: "Ouvertes",
	},
	{
		threshold: MailThresholdEnum.CONTACT,
		label: "Formulaire de contact",
		describeLimit: ({ contactStop }) => `Ferme à ${contactStop} envois`,
		closedState: "Fermé",
		openState: "Ouvert",
	},
	{
		threshold: MailThresholdEnum.DAILY,
		label: "Tous les envois, connexion comprise",
		describeLimit: ({ dailyLimit }) =>
			`Plafond de Brevo : ${dailyLimit} envois`,
		closedState: "Arrêtés",
		openState: "Actifs",
	},
];

// Ce que le seuil franchi a fermé, et ce qui reste ouvert : les seuils précédents sont franchis eux aussi
export function describeQuotaStatuses(
	threshold: MailThresholdEnum,
	limits: MailQuotaLimits,
): MailStatus[] {
	const crossedCount =
		QUOTA_FEATURES.findIndex((feature) => feature.threshold === threshold) + 1;
	return QUOTA_FEATURES.map((feature, index) => {
		const isClosed = index < crossedCount;
		return {
			label: feature.label,
			detail: feature.describeLimit(limits),
			state: isClosed ? feature.closedState : feature.openState,
			isAlert: isClosed,
		};
	});
}
