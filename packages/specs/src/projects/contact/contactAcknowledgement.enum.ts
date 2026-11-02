// Ce qu'il est advenu de l'accusé de réception d'un message arrivé
export enum ContactAcknowledgementEnum {
	SENT = "SENT",
	// Un seul par adresse et par jour : celle-ci en a déjà reçu un
	ALREADY_SENT_TODAY = "ALREADY_SENT_TODAY",
	// Le fournisseur ne l'a pas pris : le message est arrivé quand même
	FAILED = "FAILED",
	// Aucune adresse donnée
	NO_EMAIL = "NO_EMAIL",
}
