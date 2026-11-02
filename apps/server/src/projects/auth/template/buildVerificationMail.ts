import { pluralize } from "@citadel/common/src/universal/string/pluralize.ts";

import type { Mail } from "../../../mail/mail.type.ts";
import { buildMailBodies } from "../../../mail/template/buildMailBodies.ts";
import type { MailBlock } from "../../../mail/template/mailBlock.type.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

/**
 * Les mails qui portent un lien et un code (inscription, connexion par mail, mot de passe oublié…), tous bâtis pareil :
 * ce qu'il faut faire, le bouton, le code, la durée, puis pourquoi on le reçoit. Le lien ne marche que dans le
 * navigateur qui a commencé le parcours : le code sert à tout le reste, un autre appareil compris
 */
export function buildVerificationMail(
	content: VerificationMailContent,
	{ email, linkUrl, code, validityMinutes }: VerificationMailParameters,
): Mail {
	const validity = pluralize(validityMinutes, "minute");
	const paragraphs = content.paragraphs.map((text): MailBlock => ({
		kind: "paragraph",
		text,
	}));
	return {
		kind: content.kind,
		to: { email, name: null },
		replyTo: null,
		subject: content.subject,
		...buildMailBodies({
			preview: `${content.title} : un lien et un code, valables ${validity}.`,
			accent: content.accent,
			kicker: content.kicker,
			title: content.title,
			lead: content.lead,
			blocks: [
				{ kind: "paragraph", text: "Bonjour," },
				...paragraphs,
				{ kind: "button", label: content.buttonLabel, href: linkUrl },
				{
					kind: "paragraph",
					text: "Par préférence ou si le lien ne fonctionne pas, tu peux aussi saisir ce code sur la page restée ouverte :",
				},
				{ kind: "code", label: "Ton code", code },
				{
					kind: "paragraph",
					text: `Le lien et le code sont valables ${validity}.`,
				},
				{ kind: "paragraph", text: content.ifNotYou },
			],
			note: `Tu reçois cet email parce que ${content.reason}.`,
		}),
	};
}
