export enum E2eCredentialsEnum {
	// Accepté par le formulaire (12 caractères au moins, pas trop faible)
	VALID_PASSWORD = "Un-mot-de-passe-solide-2026!",
	// Refusés ou jugés « Très faible » (scénario A3)
	TOO_SHORT_PASSWORD = "Abcdefgh-12",
	WEAK_PASSWORD_KEYBOARD = "azertyuiop12",
	WEAK_PASSWORD_REPEATED = "aaaaaaaaaaaa",
	WEAK_PASSWORD_DIGITS = "123456789012",
}
