const ENUM_VALUE = /'([^']*)'/g;

// « enum('mail','password','both') », tel que information_schema l'écrit → ["mail", "password", "both"]
export function parseEnumColumnType(columnType: string): string[] {
	return [...columnType.matchAll(ENUM_VALUE)].map((match) => match[1] ?? "");
}
