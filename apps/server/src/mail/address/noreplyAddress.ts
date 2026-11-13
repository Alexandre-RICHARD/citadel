import type { MailAddress } from "../mailAddress.type.ts";
import { MAIL_SITE } from "../mailSite.ts";

// Expéditeur de tous les emails du site ; déclaré chez Brevo, il ne reçoit rien
export const NOREPLY_ADDRESS: MailAddress = {
	email: `noreply@${MAIL_SITE.host}`,
	name: MAIL_SITE.name,
};
