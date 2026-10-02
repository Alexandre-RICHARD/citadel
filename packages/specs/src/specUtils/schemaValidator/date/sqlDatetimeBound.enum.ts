// Plus petite date qu'une colonne DATETIME de MariaDB sait stocker, en UTC comme la base.
// En dessous, la valeur est enregistrée faussée sans erreur (l'an 1 devient 2001)
export enum SqlDatetimeBoundEnum {
	MIN = "1000-01-01T00:00:00.000Z",
}
