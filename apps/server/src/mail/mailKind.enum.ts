// Ce qu'est un mail, sans rien de son contenu : le journal et les logs d'erreur ne donnent que ça
export enum MailKindEnum {
	CONTACT_NOTIFICATION = "contact-notification",
	CONTACT_ACKNOWLEDGEMENT = "contact-acknowledgement",
	QUOTA_ALERT = "quota-alert",
	AUTH_REGISTRATION = "auth-registration",
	AUTH_REGISTRATION_EXISTING_ACCOUNT = "auth-registration-existing-account",
	AUTH_PASSWORD_RESET = "auth-password-reset",
	AUTH_MAIL_LOGIN = "auth-mail-login",
	AUTH_SECOND_FACTOR = "auth-second-factor",
	AUTH_EMAIL_FACTOR_ACTIVATION = "auth-email-factor-activation",
	AUTH_EMAIL_CHANGE = "auth-email-change",
	AUTH_EMAIL_CHANGE_ADDRESS_TAKEN = "auth-email-change-address-taken",
	AUTH_NOTICE_PASSWORD_CHANGED = "auth-notice-password-changed",
	AUTH_NOTICE_EMAIL_CHANGED = "auth-notice-email-changed",
	AUTH_NOTICE_SECOND_FACTOR_ADDED = "auth-notice-second-factor-added",
	AUTH_NOTICE_SECOND_FACTOR_REMOVED = "auth-notice-second-factor-removed",
	AUTH_NOTICE_ACCOUNT_DELETED = "auth-notice-account-deleted",
}
