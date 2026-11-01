// Codes d'erreur des mails du site, partagés par les endpoints qui en envoient
export enum MailErrorCodeEnum {
	// Le fournisseur d'envoi n'a pas pris le mail (injoignable, clé refusée, quota épuisé) : réessayer plus tard
	MAIL_UNAVAILABLE = "MAIL_UNAVAILABLE",
}
