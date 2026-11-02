import { ContactAcknowledgementEnum } from "@citadel/specs/src/projects/contact/contactAcknowledgement.enum";

const LINES: Record<
	ContactAcknowledgementEnum,
	(email: string | null) => string
> = {
	[ContactAcknowledgementEnum.SENT]: (email) =>
		`Un accusé de réception est parti vers ${email}.`,
	[ContactAcknowledgementEnum.ALREADY_SENT_TODAY]: (email) =>
		`${email} a déjà reçu un accusé de réception aujourd’hui : pas de nouveau pour ce message.`,
	[ContactAcknowledgementEnum.FAILED]: (email) =>
		`L’accusé de réception n’a pas pu partir vers ${email}, mais je vous répondrai bien à cette adresse.`,
	[ContactAcknowledgementEnum.NO_EMAIL]: () =>
		"Sans adresse, je ne pourrai pas vous répondre.",
};

// La ligne de l'écran « Message envoyé » sur l'accusé de réception. `email` : l'adresse donnée, null sans adresse
export function describeAcknowledgement(
	acknowledgement: ContactAcknowledgementEnum,
	email: string | null,
): string {
	return LINES[acknowledgement](email);
}
