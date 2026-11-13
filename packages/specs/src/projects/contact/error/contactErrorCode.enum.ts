// Codes d'erreur métier du formulaire de contact
export enum ContactErrorCodeEnum {
	// Le quota quotidien d'emails est presque épuisé : le formulaire rouvre demain, l'adresse `contact` reste affichée
	CONTACT_CLOSED = "CONTACT_CLOSED",
}
