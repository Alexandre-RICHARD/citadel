import type { MailAccentEnum } from "./mailAccent.enum.ts";
import type { MailBlock } from "./mailBlock.type.ts";

export type MailLayout = {
	// Ce que la boîte de réception affiche après l'objet ; caché dans le mail
	preview: string;
	accent: MailAccentEnum;
	// L'en-tête : une étiquette, le titre, puis un chapô ; null : aucun
	kicker: string;
	title: string;
	lead: string | null;
	// Du vrai texte avant tout : un mail trop court, face au pixel de suivi de Brevo, passe pour du spam
	blocks: MailBlock[];
	// Petites lignes grises sous la carte ; null : aucune
	note: string | null;
};
