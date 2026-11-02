import type { Mail } from "../mail.type.ts";
import { renderMailHtml } from "./html/renderMailHtml.ts";
import type { MailLayout } from "./mailLayout.type.ts";
import { renderMailText } from "./text/renderMailText.ts";

/**
 * Le même contenu en texte brut et en HTML, tout le texte échappé. Le HTML, aux couleurs de la Citadel, n'a ni image
 * ni ressource externe : rien à bloquer, et les filtres anti-spam comptent le pixel de Brevo face à du vrai texte
 */
export function buildMailBodies(
	layout: MailLayout,
): Pick<Mail, "text" | "html"> {
	return {
		text: renderMailText(layout),
		html: renderMailHtml(layout),
	};
}
