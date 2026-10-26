// Règle qu'un champ ne respecte pas, dans un 400 : le front la traduit pour l'afficher
export enum ValidationIssueCodeEnum {
	// Type JSON inattendu, ou champ absent
	INVALID_TYPE = "INVALID_TYPE",
	// Texte au format inattendu : date ISO 8601, nombre écrit en chiffres…
	INVALID_FORMAT = "INVALID_FORMAT",
	// Texte contenant une moitié d'emoji isolée, que la base remplacerait par « � »
	INVALID_CHARACTERS = "INVALID_CHARACTERS",
	// Texte de moins de `limit` caractères
	TOO_SHORT = "TOO_SHORT",
	// Texte de plus de `limit` caractères
	TOO_LONG = "TOO_LONG",
	// Nombre inférieur à `limit`
	TOO_SMALL = "TOO_SMALL",
	// Nombre supérieur à `limit`
	TOO_BIG = "TOO_BIG",
	NOT_INTEGER = "NOT_INTEGER",
	// Nombre avec plus de `limit` chiffres après la virgule
	TOO_MANY_DECIMALS = "TOO_MANY_DECIMALS",
	FUTURE_DATE = "FUTURE_DATE",
	// Date antérieure à SqlDatetimeBoundEnum.MIN
	DATE_TOO_OLD = "DATE_TOO_OLD",
	// Aucun des champs optionnels d'un corps qui en exige au moins un
	MISSING_FIELDS = "MISSING_FIELDS",
	// Valeur présente plusieurs fois dans une liste qui les veut uniques
	DUPLICATE_VALUE = "DUPLICATE_VALUE",
	// Valeur valide seule, mais refusée avec un autre champ du corps (un statut que le type de fin ne propose pas…)
	INCOMPATIBLE_VALUE = "INCOMPATIBLE_VALUE",
	// Règle sans code dédié
	INVALID_VALUE = "INVALID_VALUE",
}
