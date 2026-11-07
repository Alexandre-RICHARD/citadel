export type ReceivedMail = {
	subject: string;
	text: string;
	html: string;
	// Les destinataires du mail
	to: string[];
	// Les adresses de l'en-tête Reply-To (vide s'il n'y en a pas)
	replyTo: string[];
	// Le lien du mail vers le site (premier lien contenant /auth/), ou null
	link: string | null;
	// Le code à 6 chiffres du mail, ou null
	code: string | null;
};
