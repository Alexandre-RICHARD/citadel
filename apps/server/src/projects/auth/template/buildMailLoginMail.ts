import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_MAIL_LOGIN,
	subject: "Ton lien de connexion",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Connexion",
	title: "Ton lien de connexion",
	lead: "Connecte-toi sans mot de passe.",
	paragraphs: [
		`Tu as demandé à te connecter au site ${MAIL_SITE.quotedName} par email. Clique sur le bouton ci-dessous pour ouvrir ta session. Si une application d'authentification est activée sur ton compte, elle te sera demandée ensuite.`,
	],
	buttonLabel: "Me connecter",
	reason: `une connexion par email a été demandée pour le compte lié à cette adresse email sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette demande, ignore cet email : personne ne sera connecté sans ce lien ni ce code.",
};

// La connexion sans mot de passe : le lien ou le code ouvrent la session, après la double authentification s'il y en a une
export function buildMailLoginMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
