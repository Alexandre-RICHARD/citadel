import type { MailAddress } from "../mailAddress.type.ts";

// Expéditeur de tous les mails du site ; déclaré chez Brevo, il ne reçoit rien
export const NOREPLY_ADDRESS: MailAddress = {
	email: "noreply@alexandre-richard.fr",
	name: "La Citadel d'Alex",
};
