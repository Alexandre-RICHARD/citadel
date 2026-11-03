// Ce que retient le journal de sécurité (auth_event). Colonne en VARCHAR : un nouveau type s'ajoute sans migration.
// Un parcours jamais confirmé se lit dans le journal : un début sans fin
export enum AuthEventTypeEnum {
	LOGIN_SUCCEEDED = "login_succeeded",
	// Mot de passe refusé ; sans compte trouvé, user_id reste vide
	LOGIN_FAILED = "login_failed",
	// Second facteur refusé (connexion ou mot de passe oublié) : le mot de passe, ou la boîte mail, est donc connu
	SECOND_FACTOR_FAILED = "second_factor_failed",
	REGISTRATION_STARTED = "registration_started",
	REGISTRATION_COMPLETED = "registration_completed",
	SECOND_FACTOR_ADDED = "second_factor_added",
	SECOND_FACTOR_REMOVED = "second_factor_removed",
	RECOVERY_CODES_REGENERATED = "recovery_codes_regenerated",
	// Mot de passe redemandé avant une action sensible, et refusé
	PASSWORD_CONFIRMATION_FAILED = "password_confirmation_failed",
	PASSWORD_CHANGED = "password_changed",
	EMAIL_CHANGED = "email_changed",
}
