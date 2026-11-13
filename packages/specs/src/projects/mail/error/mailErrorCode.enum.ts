// Codes d'erreur des emails du site, partagés par les endpoints qui en envoient
export enum MailErrorCodeEnum {
	// Le fournisseur d'envoi n'a pas pris l'email (injoignable, clé refusée, quota épuisé) : réessayer plus tard
	MAIL_UNAVAILABLE = "MAIL_UNAVAILABLE",
}
