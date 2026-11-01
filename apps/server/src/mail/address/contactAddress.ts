import { CONTACT_EMAIL } from "@citadel/specs/src/projects/contact/contactEmail.ts";

import type { MailAddress } from "../mailAddress.type.ts";

// Reçoit les notifications du formulaire, les alertes de quota et les réponses aux accusés de réception
export const CONTACT_ADDRESS: MailAddress = {
	email: CONTACT_EMAIL,
	name: "Alexandre Richard",
};
