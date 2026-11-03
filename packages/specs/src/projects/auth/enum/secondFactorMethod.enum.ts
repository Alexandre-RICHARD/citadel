// Ce qui prouve le second facteur, au choix de l'utilisateur parmi ceux que l'étape propose
export enum SecondFactorMethodEnum {
	// Le code de l'application d'authentification
	TOTP = "totp",
	// Le code reçu par email : seulement après le mot de passe, jamais après un email (la boîte vient d'être prouvée)
	EMAIL = "email",
	// Un code de secours, à usage unique
	RECOVERY_CODE = "recovery_code",
}
