// Pourquoi la relance du soir s'est arrêtée avant d'avoir vidé les messages en attente
export enum ContactRetryStopEnum {
	// Le seuil du quota quotidien d'emails pour le contact est atteint : le reste attend le lendemain soir
	QUOTA_REACHED = "QUOTA_REACHED",
	// Le fournisseur a refusé un envoi : inutile d'insister ce soir-là
	SEND_FAILED = "SEND_FAILED",
}
