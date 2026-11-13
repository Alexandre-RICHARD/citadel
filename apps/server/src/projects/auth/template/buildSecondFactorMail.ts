import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_SECOND_FACTOR,
	subject: "Ton code de connexion",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Double authentification",
	title: "Ton code de connexion",
	lead: "Une vérification de plus pour ouvrir ta session.",
	paragraphs: [
		`Ton mot de passe vient d'être saisi pour te connecter au site ${MAIL_SITE.quotedName}. Pour finir, valide cette connexion avec le bouton ci-dessous.`,
	],
	buttonLabel: "Valider la connexion",
	reason: `le mot de passe du compte lié à cette adresse email vient d'être saisi sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette connexion, ton compte reste protégé : personne ne peut ouvrir de session sans ce code. Quelqu'un connaît cependant ton mot de passe, change-le dès que possible.",
};

// Après un mot de passe correct, pour qui a choisi le code par email comme double authentification
export function buildSecondFactorMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
