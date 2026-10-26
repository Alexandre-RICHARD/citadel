// Un numéro dans une série est stocké avec 3 décimales : les calculs se font en millièmes, sans erreur d'arrondi
export enum SeriesNumberScaleEnum {
	THOUSANDTHS = 1000,
	MAX_DECIMALS = 3,
	// Plus grand numéro d'une colonne DECIMAL(7,3)
	MAX = 9999.999,
}
