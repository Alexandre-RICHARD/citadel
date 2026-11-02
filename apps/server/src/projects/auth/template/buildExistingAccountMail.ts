import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { AUTH_MAIL_URLS } from "./authMailUrls.ts";
import { describeElapsedTime } from "./describeElapsedTime.ts";

/**
 * À l'adresse qui s'inscrit alors qu'elle a déjà un compte. La page d'inscription répond comme pour une adresse
 * nouvelle : c'est ce mail, dans la seule boîte concernée, qui dit la vérité. Ni lien à jeton ni code, rien à confirmer
 */
export function buildExistingAccountMail(
	email: string,
	lastLoginAt: Date,
	now: Date,
): Mail {
	return {
		kind: MailKindEnum.AUTH_REGISTRATION_EXISTING_ACCOUNT,
		to: { email, name: null },
		replyTo: null,
		subject: "Tu as déjà un compte",
		...buildMailBodies({
			preview:
				"Cette adresse email est déjà inscrite : connecte-toi avec ton compte.",
			accent: MailAccentEnum.MAGENTA,
			kicker: "Inscription",
			title: "Tu as déjà un compte",
			lead: "Un compte avec cette adresse email existe déjà.",
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				{
					kind: "paragraph",
					text: `Quelqu'un a voulu créer un compte sur le site ${MAIL_SITE.quotedName} avec cette adresse email. Comme un compte est déjà relié à celle-ci, aucune action n'a été effectuée et rien n'a changé pour ton compte.`,
				},
				{
					kind: "paragraph",
					text: `Ta dernière connexion : ${describeElapsedTime(lastLoginAt, now)}.`,
				},
				{
					kind: "paragraph",
					text: "Tu peux te connecter normalement. Si tu as oublié ton mot de passe, la page de connexion permet d'en choisir un nouveau, ou de recevoir un lien de connexion par email.",
				},
				{
					kind: "paragraph",
					text: "Si tu n'es pas à l'origine de cette demande, ignore cet email : personne n'a eu accès à ton compte.",
				},
				{
					kind: "button",
					label: "Me connecter",
					href: AUTH_MAIL_URLS.login,
				},
			],
			note: `Tu reçois cet email parce que cette adresse email a été utilisée pour créer un compte sur le site ${MAIL_SITE.quotedName}.`,
		}),
	};
}
