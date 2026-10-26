// Sorte de filtre d'une colonne
export enum ColumnFilterKindEnum {
	// « contient », ou valeur exacte après un clic sur une série
	TEXT = "text",
	// Une valeur de liste : type de fin, statut, plateforme
	VALUE = "value",
	// Oui ou non, pour une case à cocher
	BOOLEAN = "boolean",
	// Bornes incluses ; les temps sont en minutes
	NUMBER_RANGE = "numberRange",
	DATE_RANGE = "dateRange",
}
