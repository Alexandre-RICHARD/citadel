import type { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import type { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";

// Ce qui change d'un email à lien et code à l'autre
export type VerificationMailContent = {
	kind: MailKindEnum;
	subject: string;
	accent: MailAccentEnum;
	kicker: string;
	title: string;
	lead: string;
	// Ce que l'email fait faire, avant le bouton
	paragraphs: string[];
	buttonLabel: string;
	// Pourquoi le destinataire reçoit cet email, après « Tu reçois cet email parce que »
	reason: string;
	// Ce que fait le destinataire s'il n'est pas à l'origine de la demande, en une phrase
	ifNotYou: string;
};
