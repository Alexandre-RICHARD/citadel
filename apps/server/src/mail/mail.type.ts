import type { MailAddress } from "./mailAddress.type.ts";
import type { MailKindEnum } from "./mailKind.enum.ts";

// Un email à envoyer, toujours de `noreply`, en HTML et en texte brut
export type Mail = {
	// Seule information de l'email que le journal écrit dans le log
	kind: MailKindEnum;
	to: MailAddress;
	// Où va une réponse : `noreply` ne reçoit rien
	replyTo: MailAddress | null;
	subject: string;
	text: string;
	html: string;
};
