import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_PASSWORD_RESET,
	subject: "Choisis un nouveau mot de passe",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Mot de passe oublié",
	title: "Choisis un nouveau mot de passe",
	lead: "Tu as demandé à réinitialiser ton mot de passe.",
	paragraphs: [
		"Pour choisir un nouveau mot de passe, clique sur le bouton ci-dessous. Si une double authentification est activée sur ton compte, elle te sera demandée avant de continuer.",
	],
	buttonLabel: "Choisir un nouveau mot de passe",
	reason: `un nouveau mot de passe a été demandé pour le compte lié à cette adresse email sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette demande, ignore cet email : ton mot de passe actuel reste valable.",
};

// À l'adresse du compte, jamais affichée à l'écran : seul son propriétaire apprend que la demande est partie
export function buildPasswordResetMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
