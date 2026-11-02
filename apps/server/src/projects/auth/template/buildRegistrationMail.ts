import type { Mail } from "../../../mail/mail.type.ts";
import { MailKindEnum } from "../../../mail/mailKind.enum.ts";
import { MAIL_SITE } from "../../../mail/mailSite.ts";
import { MailAccentEnum } from "../../../mail/template/mailAccent.enum.ts";
import { buildVerificationMail } from "./buildVerificationMail.ts";
import type { VerificationMailContent } from "./verificationMailContent.type.ts";
import type { VerificationMailParameters } from "./verificationMailParameters.type.ts";

const CONTENT: VerificationMailContent = {
	kind: MailKindEnum.AUTH_REGISTRATION,
	subject: "Confirme ton inscription",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Inscription",
	title: "Confirme ton inscription",
	lead: "Une dernière étape avant de créer ton compte.",
	paragraphs: [
		`Tu as commencé à créer un compte sur le site ${MAIL_SITE.quotedName}. Pour confirmer que cette adresse email est bien la tienne, clique sur le bouton ci-dessous : ton compte sera créé et tu seras connecté.`,
	],
	buttonLabel: "Confirmer mon inscription",
	reason: `cette adresse email a été utilisée pour créer un compte sur le site ${MAIL_SITE.quotedName}`,
	ifNotYou:
		"Si tu n'es pas à l'origine de cette demande, ignore cet email : aucun compte ne sera créé.",
};

// Au futur inscrit : son adresse n'est confirmée que par ce lien ou ce code
export function buildRegistrationMail(
	parameters: VerificationMailParameters,
): Mail {
	return buildVerificationMail(CONTENT, parameters);
}
