import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail.ts";

import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import type { MailBlock } from "../../../mail/template/mailBlock.type.ts";
import { AUTH_MAIL_URLS } from "./authMailUrls.ts";
import type { SecurityNoticeKind } from "./securityNoticeKind.type.ts";

type NoticeWording = {
	subject: string;
	lead: string;
	// Ce qui vient de se passer
	paragraphs: string[];
	// Ce que fait le destinataire s'il n'en est pas l'auteur, sur sa propre ligne
	ifNotYou: string;
	// Aucun : rien à défaire (compte supprimé) ou aucune page où le faire (ancienne adresse)
	button: { label: string; href: string } | null;
};

const SECURITY_LEAD =
	"Une modification de sécurité vient d'avoir lieu sur ton compte.";

// Le mot de passe se réinitialise par la boîte du compte. Après un changement d'adresse, celle-ci n'est plus la boîte de
// l'ancien propriétaire, et un compte supprimé n'a plus de mot de passe : il ne reste alors que le contact
const IF_NOT_YOU_RESET_PASSWORD = `Si tu n'as pas effectué cette action, réinitialise ton mot de passe immédiatement ou envoie un message à ${CONTACT_EMAIL} si besoin.`;
const IF_NOT_YOU_CONTACT = `Si tu n'as pas effectué cette action, envoie un message à ${CONTACT_EMAIL} immédiatement.`;

const RESET_PASSWORD_BUTTON = {
	label: "Réinitialiser mon mot de passe",
	href: AUTH_MAIL_URLS.forgotPassword,
};

const WORDINGS: Record<SecurityNoticeKind, NoticeWording> = {
	[MailKindEnum.AUTH_NOTICE_PASSWORD_CHANGED]: {
		subject: "Ton mot de passe a été modifié",
		lead: SECURITY_LEAD,
		paragraphs: [
			`Le mot de passe de ton compte sur le site ${MAIL_SITE.quotedName} vient d'être changé. Par précaution, les autres sessions ouvertes sur ton compte ont été fermées.`,
		],
		ifNotYou: IF_NOT_YOU_RESET_PASSWORD,
		button: RESET_PASSWORD_BUTTON,
	},
	[MailKindEnum.AUTH_NOTICE_EMAIL_CHANGED]: {
		subject: "Ton adresse email a été modifiée",
		lead: SECURITY_LEAD,
		paragraphs: [
			`L'adresse email de ton compte sur le site ${MAIL_SITE.quotedName} vient d'être remplacée. Cet email, envoyé à l'ancienne adresse email, te prévient du changement : les prochains emails iront à la nouvelle.`,
		],
		ifNotYou: IF_NOT_YOU_CONTACT,
		button: null,
	},
	[MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_ADDED]: {
		subject: "Une double authentification a été ajoutée",
		lead: SECURITY_LEAD,
		paragraphs: [
			`Une double authentification vient d'être ajoutée à ton compte sur le site ${MAIL_SITE.quotedName} : elle te sera demandée à chaque connexion, en plus de ton mot de passe.`,
		],
		ifNotYou: IF_NOT_YOU_RESET_PASSWORD,
		button: RESET_PASSWORD_BUTTON,
	},
	[MailKindEnum.AUTH_NOTICE_SECOND_FACTOR_REMOVED]: {
		subject: "Une double authentification a été retirée",
		lead: SECURITY_LEAD,
		paragraphs: [
			`Une double authentification vient d'être retirée de ton compte sur le site ${MAIL_SITE.quotedName}. S'il n'en restait plus aucune, ton compte n'est plus protégé que par son mot de passe, et les codes de secours qui avaient été générés sont maintenant invalides.`,
		],
		ifNotYou: IF_NOT_YOU_RESET_PASSWORD,
		button: RESET_PASSWORD_BUTTON,
	},
	[MailKindEnum.AUTH_NOTICE_ACCOUNT_DELETED]: {
		subject: "Ton compte a été supprimé",
		lead: "La suppression est immédiate et définitive.",
		paragraphs: [
			`Ton compte sur le site ${MAIL_SITE.quotedName} et toutes les données qui y étaient liées viennent d'être supprimés. Il n'existe aucun délai de récupération.`,
			"Seules les sauvegardes techniques du site en gardent encore une copie, qui disparaît au plus tard dans trois mois.",
		],
		ifNotYou: IF_NOT_YOU_CONTACT,
		button: null,
	},
};

/**
 * Au titulaire du compte, après une modification de sécurité : s'il n'en est pas l'auteur, il le sait aussitôt. Il part
 * à l'adresse du compte, l'ancienne pour un changement d'adresse
 */
export function buildSecurityNoticeMail(
	kind: SecurityNoticeKind,
	email: string,
): Mail {
	const { subject, lead, paragraphs, ifNotYou, button } = WORDINGS[kind];
	const buttonBlocks: MailBlock[] =
		button === null ? [] : [{ kind: "button", ...button }];
	return {
		kind,
		to: { email, name: null },
		replyTo: null,
		subject,
		...buildMailBodies({
			preview: lead,
			accent: MailAccentEnum.ORANGE,
			kicker: "Sécurité du compte",
			title: subject,
			lead,
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				...[...paragraphs, ifNotYou].map((text): MailBlock => ({
					kind: "paragraph",
					text,
				})),
				...buttonBlocks,
			],
			note: "Ce message de sécurité est envoyé à l'adresse email concernée.",
		}),
	};
}
