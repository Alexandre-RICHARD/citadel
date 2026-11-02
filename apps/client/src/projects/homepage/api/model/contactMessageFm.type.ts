// Un message du formulaire de contact, tel que le formulaire l'envoie
export type ContactMessageFm = {
	subject: string;
	message: string;
	// null : non donné
	email: string | null;
	name: string | null;
	// Le champ piège : vide pour un humain
	website: string;
};
