export type MailAccentColors = {
	// Assez soutenue pour porter un texte blanc (bouton)
	hue: string;
	// Texte posé sur `subtle`
	strong: string;
	subtle: string;
	border: string;
	// Lueur de l'en-tête et début du dégradé de la jauge
	glow: string;
	dark: {
		hue: string;
		// Texte posé sur `hue`
		content: string;
		subtle: string;
		border: string;
	};
};
