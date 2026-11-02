import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_EMAIL_CHANGE,
	subject: "Confirme ta nouvelle adresse email",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Changement d'adresse email",
	title: "Confirme ta nouvelle adresse email",
	lead: "Cette adresse email remplacera l'actuelle sur ton compte.",
	paragraphs: [
		`Tu as demandé à utiliser cette adresse email pour ton compte sur le site ${MAIL_SITE.quotedName}. Clique sur le bouton ci-dessous pour la confirmer : elle remplacera aussitôt l'ancienne, et c'est à elle que seront envoyés les prochains emails.`,
	],
	buttonLabel: "Confirmer cette adresse email",
	reason: `cette adresse email a été indiquée comme nouvelle adresse email d'un compte sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette demande, ignore cet email : l'adresse email du compte ne changera pas.",
};

// À la nouvelle adresse seulement : elle ne remplace l'ancienne qu'une fois confirmée
export function buildEmailChangeMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
