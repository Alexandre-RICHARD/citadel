// Valeurs de MAIL_SENDER : qui envoie les emails du site
export enum MailSenderKindEnum {
	// Le vrai fournisseur : la prod, ou le dev pour un envoi réel
	BREVO = "brevo",
	// Une ligne dans le log par email, sans son contenu : le dev, et la pré-prod (qui tourne sur .env.prod)
	JOURNAL = "journal",
	// Gardés en mémoire, lus par les tests d'intégration
	MEMORY = "memory",
}
