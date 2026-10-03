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
	FUTURE_DATE = "FUTURE_DATE",
	// Date antérieure à SqlDatetimeBoundEnum.MIN
	DATE_TOO_OLD = "DATE_TOO_OLD",
	// Aucun des champs optionnels d'un corps qui en exige au moins un
	MISSING_FIELDS = "MISSING_FIELDS",
	// Règle sans code dédié
	INVALID_VALUE = "INVALID_VALUE",
}
