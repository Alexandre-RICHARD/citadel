import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_EMAIL_FACTOR_ACTIVATION,
	subject: "Active le code par email",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Double authentification",
	title: "Active le code par email",
	lead: "Un dernier code pour finir l'activation.",
	paragraphs: [
		"Tu as demandé à recevoir un code par email comme double authentification. Une fois l'activation confirmée avec le bouton ci-dessous, tu pourras choisir ce code pour terminer une connexion par mot de passe.",
	],
	buttonLabel: "Activer le code par email",
	reason: `la double authentification par email a été demandée pour le compte lié à cette adresse email sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette demande, ignore cet email : la double authentification par email ne sera pas activée.",
};

// Pour activer le code par email comme double authentification : la première réception prouve que la boîte répond
export function buildEmailFactorActivationMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
