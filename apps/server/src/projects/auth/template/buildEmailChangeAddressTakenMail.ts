import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { AUTH_MAIL_URLS } from "./authMailUrls.ts";

/**
 * À l'adresse qu'un autre compte a voulu prendre. Celui qui a demandé le changement reçoit la réponse ordinaire, sans
 * savoir que l'adresse est prise : seul son propriétaire l'apprend, par ce mail, sans lien ni code
 */
export function buildEmailChangeAddressTakenMail(email: string): Mail {
	return {
		kind: MailKindEnum.AUTH_EMAIL_CHANGE_ADDRESS_TAKEN,
		to: { email, name: null },
		replyTo: null,
		subject: "Cette adresse email est déjà utilisée",
		...buildMailBodies({
			preview:
				"Un autre compte a voulu prendre cette adresse email : rien n'a été modifié.",
			accent: MailAccentEnum.MAGENTA,
			kicker: "Changement d'adresse email",
			title: "Cette adresse email est déjà utilisée",
			lead: "Un compte avec cette adresse email existe déjà.",
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				{
					kind: "paragraph",
					text: `Quelqu'un a voulu associer cette adresse email à un autre compte du site ${MAIL_SITE.quotedName}. Comme un compte est déjà relié à celle-ci, aucune action n'a été effectuée et rien n'a changé pour ton compte.`,
				},
				{
					kind: "paragraph",
					text: "Tu peux continuer à te connecter comme d'habitude.",
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
			note: `Tu reçois cet email parce qu'une demande a été faite avec cette adresse email sur le site ${MAIL_SITE.quotedName}.`,
		}),
	};
}
