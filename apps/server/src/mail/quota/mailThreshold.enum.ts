// Les seuils du quota quotidien, dans l'ordre où ils se franchissent
export enum MailThresholdEnum {
	// MAIL_REGISTRATION_STOP : plus d'inscriptions
	REGISTRATION = "registration",
	// MAIL_CONTACT_STOP : plus de formulaire de contact
	CONTACT = "contact",
	// Un email sous MAIL_DAILY_LIMIT : plus rien, le dernier envoi est l'alerte
	DAILY = "daily",
}
