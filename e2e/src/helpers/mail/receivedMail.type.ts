export type ReceivedMail = {
	subject: string;
	text: string;
	html: string;
	// Les destinataires de l'email
	to: string[];
	// Les adresses de l'en-tête Reply-To (vide s'il n'y en a pas)
	replyTo: string[];
	// Le lien de l'email vers le site (premier lien contenant /auth/), ou null
	link: string | null;
	// Le code à 6 chiffres de l'email, ou null
	code: string | null;
};
