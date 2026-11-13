const ENUM_COLUMN_TYPE = /^enum\((.*)\)$/;
// Une valeur entre apostrophes, où une apostrophe s'écrit doublée
const QUOTED_VALUE = /'((?:[^']|'')*)'/g;

// « enum('email','password','both') », tel que information_schema l'écrit → ["email", "password", "both"]
export function parseEnumColumnType(columnType: string): string[] {
	const valueList = ENUM_COLUMN_TYPE.exec(columnType)?.[1];
	if (valueList === undefined)
		throw new Error(`Colonne ENUM attendue, reçu « ${columnType} »`);
	return [...valueList.matchAll(QUOTED_VALUE)].map((match) =>
		(match[1] ?? "").replaceAll("''", "'"),
	);
}
