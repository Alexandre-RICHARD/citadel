import { ContactErrorCodeEnum } from "@citadel/specs/src/projects/contact/error/contactErrorCode.enum";
import { MailErrorCodeEnum } from "@citadel/specs/src/projects/mail/error/mailErrorCode.enum";

import type { ErrorReasons } from "../../../../common/api/error/errorReasons.type";

// Raisons des codes du formulaire de contact, après « Impossible d'envoyer le message : »
export const contactErrorReasons: ErrorReasons = {
	[ContactErrorCodeEnum.CONTACT_CLOSED]:
		"le formulaire est fermé pour aujourd'hui",
	[MailErrorCodeEnum.MAIL_UNAVAILABLE]:
		"le service d'envoi d'emails ne répond pas, réessayez plus tard",
};
