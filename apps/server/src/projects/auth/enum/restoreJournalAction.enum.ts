// Ce que le journal de restauration retient : ce qu'une sauvegarde restaurée ferait oublier, et qui doit être refait
export enum RestoreJournalActionEnum {
	ACCOUNT_DELETED = "account_deleted",
	PROJECT_DATA_DELETED = "project_data_deleted",
	EMAIL_CHANGED = "email_changed",
	// Mot de passe, facteur ajouté ou retiré, codes de secours régénérés : l'ancienne sécurité ne doit pas revenir
	SECURITY_CHANGED = "security_changed",
	// Un code de secours utilisé : à usage unique, il ne doit pas redevenir valable
	RECOVERY_CODE_USED = "recovery_code_used",
}
